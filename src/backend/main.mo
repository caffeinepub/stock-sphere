import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Int "mo:core/Int";
import Set "mo:core/Set";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type ExperienceLevel = {
    #beginner;
    #intermediate;
    #advanced;
  };

  public type UserProfile = {
    name : Text;
    bio : Text;
    experience : ExperienceLevel;
    profilePic : ?Storage.ExternalBlob;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  public type Post = {
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  module Post {
    public func compare(p1 : Post, p2 : Post) : Order.Order {
      Int.compare(p1.timestamp, p2.timestamp);
    };
  };

  public type Course = {
    id : Text;
    creator : Principal;
    title : Text;
    description : Text;
    price : Nat;
    thumbnailUrl : Text;
    createdAt : Time.Time;
    enrollmentCount : Nat;
  };

  public type Enrollment = {
    id : Text;
    user : Principal;
    courseId : Text;
    enrolledAt : Time.Time;
    completed : Bool;
  };

  // Mixin authorization and storage components
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Principal, [Post]>();
  let courses = Map.empty<Text, Course>();
  let enrollments = Map.empty<Text, Enrollment>();

  // Save user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Get caller user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Get specific user profile (authenticated users only for social platform)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(user);
  };

  // Add new post
  public shared ({ caller }) func addPost(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post insights");
    };

    let newPost : Post = {
      author = caller;
      content;
      timestamp = Time.now();
    };

    let existingPosts = switch (posts.get(caller)) {
      case (null) { [] };
      case (?userPosts) { userPosts };
    };

    let updatedPosts = existingPosts.concat([newPost]);
    posts.add(caller, updatedPosts);
  };

  // Get all posts from a specific user (authenticated users only)
  public query ({ caller }) func getUserPosts(user : Principal) : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view posts");
    };
    switch (posts.get(user)) {
      case (null) { [] };
      case (?userPosts) { userPosts };
    };
  };

  // Get all posts from all users - social feed (authenticated users only)
  public query ({ caller }) func getAllPosts() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view the feed");
    };
    var allPosts : [Post] = [];

    let iter = posts.values();
    iter.forEach(
      func(userPosts) {
        allPosts := allPosts.concat(userPosts);
      }
    );
    allPosts.sort();
  };

  // Create a new course (authenticated users only)
  public shared ({ caller }) func createCourse(id : Text, title : Text, description : Text, price : Nat, thumbnailUrl : Text) : async Course {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create courses");
    };

    let newCourse : Course = {
      id;
      creator = caller;
      title;
      description;
      price;
      thumbnailUrl;
      createdAt = Time.now();
      enrollmentCount = 0;
    };

    courses.add(id, newCourse);
    newCourse;
  };

  // Get all courses (public access for browsing)
  public query ({ caller }) func getAllCourses() : async [Course] {
    // No authorization check - courses are publicly browsable
    courses.values().toArray();
  };

  // Get courses by creator (public access for browsing)
  public query ({ caller }) func getCoursesByCreator(creator : Principal) : async [Course] {
    // No authorization check - courses are publicly browsable
    let allCourses = courses.values().toArray();
    allCourses.filter(
      func(c) {
        c.creator == creator;
      }
    );
  };

  // Get a specific course by ID (public access for browsing)
  public query ({ caller }) func getCourseById(id : Text) : async ?Course {
    // No authorization check - courses are publicly browsable
    courses.get(id);
  };

  // Enroll in a course (authenticated users only)
  public shared ({ caller }) func enrollInCourse(enrollmentId : Text, courseId : Text) : async Enrollment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can enroll in courses");
    };

    switch (courses.get(courseId)) {
      case (null) {
        Runtime.trap("Course not found");
      };
      case (?course) {
        let newEnrollment : Enrollment = {
          id = enrollmentId;
          user = caller;
          courseId;
          enrolledAt = Time.now();
          completed = false;
        };

        enrollments.add(enrollmentId, newEnrollment);

        let updatedCourse = {
          course with enrollmentCount = course.enrollmentCount + 1;
        };
        courses.add(courseId, updatedCourse);

        newEnrollment;
      };
    };
  };

  // Get user enrollments (authenticated users can only view their own, admins can view any)
  public query ({ caller }) func getUserEnrollments(user : Principal) : async [Enrollment] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own enrollments");
    };

    let allEnrollments = enrollments.values().toArray();
    allEnrollments.filter(
      func(e) {
        e.user == user
      }
    );
  };

  // Check if a user is enrolled in a specific course
  // Only the user themselves, the course creator, or admins can check enrollment status
  public query ({ caller }) func isUserEnrolled(user : Principal, courseId : Text) : async Bool {
    // Allow user to check their own enrollment
    if (caller == user) {
      let allEnrollments = enrollments.values().toArray();
      return allEnrollments.any(
        func(e) {
          e.user == user and e.courseId == courseId
        }
      );
    };

    // Allow course creator to check enrollments in their course
    switch (courses.get(courseId)) {
      case (?course) {
        if (caller == course.creator) {
          let allEnrollments = enrollments.values().toArray();
          return allEnrollments.any(
            func(e) {
              e.user == user and e.courseId == courseId
            }
          );
        };
      };
      case (null) {};
    };

    // Allow admins to check any enrollment
    if (AccessControl.isAdmin(accessControlState, caller)) {
      let allEnrollments = enrollments.values().toArray();
      return allEnrollments.any(
        func(e) {
          e.user == user and e.courseId == courseId
        }
      );
    };

    Runtime.trap("Unauthorized: Can only check your own enrollment status");
  };
};

