import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllPosts } from '../hooks/useQueries';
import CreatePostForm from '../components/CreatePostForm';
import PostFeed from '../components/PostFeed';
import { Button } from '../components/ui/button';
import { LogIn } from 'lucide-react';

export default function FeedPage() {
  const { identity, login } = useInternetIdentity();
  const { data: posts = [], isLoading } = useGetAllPosts();
  
  const isAuthenticated = !!identity;

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Stock Sphere"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="px-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Welcome to Stock Sphere</h1>
            <p className="text-lg opacity-90">Connect, learn, and grow with a community of traders</p>
          </div>
        </div>
      </div>

      {/* Create Post Section */}
      {isAuthenticated ? (
        <CreatePostForm />
      ) : (
        <div className="bg-muted/50 border border-border rounded-lg p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Join the Conversation</h2>
          <p className="text-muted-foreground">
            Sign in to share your trading insights and connect with other traders
          </p>
          <Button onClick={login} size="lg" className="gap-2">
            <LogIn className="h-4 w-4" />
            Sign In to Post
          </Button>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Trading Insights</h2>
        <PostFeed posts={posts} isLoading={isLoading} />
      </div>
    </div>
  );
}
