import { Post } from '../backend';
import PostCard from './PostCard';
import { Skeleton } from './ui/skeleton';

interface PostFeedProps {
  posts: Post[];
  isLoading?: boolean;
}

export default function PostFeed({ posts, isLoading }: PostFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-3">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No posts yet. Be the first to share your insights!</p>
      </div>
    );
  }

  // Sort posts in reverse chronological order (newest first)
  const sortedPosts = [...posts].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-4">
      {sortedPosts.map((post, index) => (
        <PostCard key={`${post.author.toString()}-${post.timestamp}-${index}`} post={post} />
      ))}
    </div>
  );
}
