import { Link } from '@tanstack/react-router';
import { useGetUserProfile } from '../hooks/useQueries';
import { Post } from '../backend';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { data: authorProfile, isLoading } = useGetUserProfile(post.author);

  const timestamp = Number(post.timestamp) / 1_000_000; // Convert nanoseconds to milliseconds
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  const profilePicUrl = authorProfile?.profilePic?.getDirectURL();
  
  const experienceColors = {
    beginner: 'bg-[oklch(0.65_0.12_200)] text-white',
    intermediate: 'bg-[oklch(0.60_0.14_80)] text-white',
    advanced: 'bg-[oklch(0.55_0.15_140)] text-white',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Link to="/profile/$principalId" params={{ principalId: post.author.toString() }}>
            <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-ring transition-all">
              <AvatarImage src={profilePicUrl || '/assets/generated/default-avatar.dim_128x128.png'} />
              <AvatarFallback>
                {isLoading ? '...' : authorProfile?.name.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <>
                  <Link
                    to="/profile/$principalId"
                    params={{ principalId: post.author.toString() }}
                    className="font-semibold hover:underline"
                  >
                    {authorProfile?.name || 'Unknown User'}
                  </Link>
                  {authorProfile && (
                    <Badge variant="outline" className={experienceColors[authorProfile.experience]}>
                      {authorProfile.experience.charAt(0).toUpperCase() + authorProfile.experience.slice(1)}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">· {timeAgo}</span>
                </>
              )}
            </div>

            <p className="text-foreground whitespace-pre-wrap break-words">{post.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
