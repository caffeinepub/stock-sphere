import { Link } from '@tanstack/react-router';
import { useGetAllCourses } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CourseCard from '../components/CourseCard';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Plus, GraduationCap } from 'lucide-react';

export default function MarketplacePage() {
  const { data: courses = [], isLoading } = useGetAllCourses();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <GraduationCap className="h-10 w-10 text-[oklch(0.55_0.15_140)]" />
            Course Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Learn from experienced traders and monetize your knowledge
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/create-course">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-lg">
          <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to create a course and share your trading knowledge!
          </p>
          {isAuthenticated && (
            <Link to="/create-course">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Course
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
