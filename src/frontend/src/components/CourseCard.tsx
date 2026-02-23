import { Link } from '@tanstack/react-router';
import { useGetUserProfile } from '../hooks/useQueries';
import { Course } from '../backend';
import { Card, CardContent, CardFooter } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Users } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { data: creatorProfile, isLoading: creatorLoading } = useGetUserProfile(course.creator);

  const priceInICP = Number(course.price) / 100_000_000;

  return (
    <Link to="/course/$id" params={{ id: course.id }}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={course.thumbnailUrl || '/assets/generated/course-placeholder.dim_400x300.png'}
            alt={course.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="pt-4 flex-1">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{Number(course.enrollmentCount)} enrolled</span>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {creatorLoading ? (
              <>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : creatorProfile ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      creatorProfile.profilePic?.getDirectURL() ||
                      '/assets/generated/default-avatar.dim_128x128.png'
                    }
                  />
                  <AvatarFallback className="text-xs">
                    {creatorProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{creatorProfile.name}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Unknown</span>
            )}
          </div>
          <p className="font-bold text-lg">{priceInICP.toFixed(2)} ICP</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
