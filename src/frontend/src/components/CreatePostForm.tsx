import { useState } from 'react';
import { useAddPost } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Loader2, Send } from 'lucide-react';

export default function CreatePostForm() {
  const [content, setContent] = useState('');
  const { mutate: addPost, isPending, isError, error } = useAddPost();

  const maxLength = 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > maxLength) return;

    addPost(content.trim(), {
      onSuccess: () => {
        setContent('');
      },
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your trading insights, market analysis, or investment ideas..."
            rows={4}
            maxLength={maxLength}
            className="resize-none"
          />
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {content.length}/{maxLength} characters
            </p>
            
            <Button type="submit" disabled={isPending || !content.trim() || content.length > maxLength}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Insight
                </>
              )}
            </Button>
          </div>

          {isError && (
            <p className="text-sm text-destructive">
              {error?.message || 'Failed to post. Please try again.'}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
