import { useParams, Link } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetUserProfile,
  useGetUserPosts,
  useGetCoursesByCreator,
  useGetUserEnrollments,
  useGetCourseById,
} from '../hooks/useQueries';
import ProfileDisplay from '../components/ProfileDisplay';
import PostFeed from '../components/PostFeed';
import CourseCard from '../components/CourseCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Edit, ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';

export default function UserProfilePage() {
  const { principalId } = useParams({ from: '/profile/$principalId' });
  const { identity } = useInternetIdentity();

  let principal: Principal | null = null;
  try {
    principal = Principal.fromText(principalId);
  } catch (e) {
    console.error('Invalid principal:', e);
  }

  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile(principal);
  const { data: userPosts = [], isLoading: postsLoading } = useGetUserPosts(principal);
  const { data: createdCourses = [], isLoading: coursesLoading } = useGetCoursesByCreator(principal);
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useGetUserEnrollments(principal);

  const isOwnProfile = identity && principal && identity.getPrincipal().toString() === principal.toString();

  if (!principal) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center py-12">
          <p className="text-destructive">Invalid user profile</p>
          <Link to="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-8">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">User profile not found</p>
          <Link to="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Link to="/">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <ProfileDisplay profile={userProfile} principal={principal} />
        
        {isOwnProfile && (
          <Link to="/profile/edit">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      {createdCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[oklch(0.55_0.15_140)]" />
            {isOwnProfile ? 'Your Courses' : 'Courses Created'}
          </h2>
          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {createdCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}

      {isOwnProfile && enrollments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[oklch(0.60_0.14_80)]" />
            Enrolled Courses
          </h2>
          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <EnrolledCourseCard key={enrollment.id} courseId={enrollment.courseId} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {isOwnProfile ? 'Your Posts' : `${userProfile.name}'s Posts`}
        </h2>
        <PostFeed posts={userPosts} isLoading={postsLoading} />
      </div>
    </div>
  );
}

function EnrolledCourseCard({ courseId }: { courseId: string }) {
  const { data: course, isLoading } = useGetCourseById(courseId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (!course) {
    return null;
  }

  return <CourseCard course={course} />;
}
