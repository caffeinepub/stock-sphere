import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
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

  public type Post = {
    author : Principal;
    content : Text;
    timestamp : Time.Time;
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

  public type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    posts : Map.Map<Principal, [Post]>;
  };

  public type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    posts : Map.Map<Principal, [Post]>;
    courses : Map.Map<Text, Course>;
    enrollments : Map.Map<Text, Enrollment>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      courses = Map.empty<Text, Course>();
      enrollments = Map.empty<Text, Enrollment>();
    };
  };
};

