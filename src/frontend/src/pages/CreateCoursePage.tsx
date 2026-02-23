import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CreateCourseForm from '../components/CreateCourseForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';

export default function CreateCoursePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/marketplace' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container max-w-3xl py-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => navigate({ to: '/marketplace' })}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <GraduationCap className="h-6 w-6 text-[oklch(0.55_0.15_140)]" />
            Create New Course
          </CardTitle>
          <CardDescription>
            Share your trading expertise and help others learn. Fill in the details below to create your course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateCourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
