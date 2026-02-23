import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCourseById,
  useGetUserProfile,
  useIsUserEnrolled,
  useEnrollInCourse,
} from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, Users, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CourseDetailPage() {
  const { id } = useParams({ from: '/course/$id' });
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const { data: course, isLoading: courseLoading } = useGetCourseById(id);
  const { data: creatorProfile, isLoading: creatorLoading } = useGetUserProfile(
    course?.creator || null
  );

  const userPrincipal = identity?.getPrincipal() || null;
  const { data: isEnrolled = false, isLoading: enrollmentCheckLoading } = useIsUserEnrolled(
    userPrincipal,
    id
  );

  const { mutate: enroll, isPending: enrolling } = useEnrollInCourse();

  const isAuthenticated = !!identity;
  const isCreator = course && identity && course.creator.toString() === identity.getPrincipal().toString();

  const handleEnroll = () => {
    if (!course) return;
    const enrollmentId = `${userPrincipal?.toString()}-${course.id}-${Date.now()}`;
    enroll(
      { enrollmentId, courseId: course.id },
      {
        onSuccess: () => {
          // Success feedback is handled by the UI state change
        },
      }
    );
  };

  if (courseLoading) {
    return (
      <div className="container max-w-5xl py-8 space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="text-center py-16">
          <p className="text-destructive mb-4">Course not found</p>
          <Button variant="outline" onClick={() => navigate({ to: '/marketplace' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const timestamp = Number(course.createdAt) / 1_000_000;
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  const priceInICP = Number(course.price) / 100_000_000;

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => navigate({ to: '/marketplace' })}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted border border-border">
            <img
              src={course.thumbnailUrl || '/assets/generated/course-placeholder.dim_400x300.png'}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {Number(course.enrollmentCount)} enrolled
              </span>
              <span>Created {timeAgo}</span>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-3">About this course</h2>
              <p className="text-foreground whitespace-pre-wrap">{course.description}</p>
            </CardContent>
          </Card>

          {isEnrolled && (
            <Card className="border-[oklch(0.55_0.15_140)] bg-[oklch(0.55_0.15_140)]/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[oklch(0.55_0.15_140)] mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">You're enrolled in this course!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access your course materials and start learning.
                    </p>
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Access Course Content
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-3xl font-bold">{priceInICP.toFixed(2)} ICP</p>
                <p className="text-sm text-muted-foreground">Course price</p>
              </div>

              {!isAuthenticated ? (
                <Button className="w-full" disabled>
                  Login to Enroll
                </Button>
              ) : isCreator ? (
                <Button className="w-full" variant="outline" disabled>
                  Your Course
                </Button>
              ) : isEnrolled ? (
                <Button className="w-full" variant="outline" disabled>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Enrolled
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleEnroll}
                  disabled={enrolling || enrollmentCheckLoading}
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Instructor</h3>
              {creatorLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ) : creatorProfile ? (
                <Link
                  to="/profile/$principalId"
                  params={{ principalId: course.creator.toString() }}
                  className="flex items-center gap-3 hover:bg-accent/50 p-2 rounded-lg transition-colors -m-2"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        creatorProfile.profilePic?.getDirectURL() ||
                        '/assets/generated/default-avatar.dim_128x128.png'
                      }
                    />
                    <AvatarFallback>{creatorProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{creatorProfile.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {creatorProfile.experience.charAt(0).toUpperCase() +
                        creatorProfile.experience.slice(1)}
                    </Badge>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Instructor profile not available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
