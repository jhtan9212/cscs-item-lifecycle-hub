import { useState } from 'react';
import type { Comment } from '@/types/project';
import { commentService } from '@/services/commentService';
import { formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CommentListProps {
  projectId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export const CommentList = ({ projectId, comments, onCommentAdded }: CommentListProps) => {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await commentService.create(projectId, newComment.trim());
      setNewComment('');
      onCommentAdded();
      toast({
        title: 'Comment Added',
        description: 'Your comment has been successfully added.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add comment';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment about this project..."
              required
            />
            <Button type="submit" disabled={loading || !newComment.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Comment'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={comment.id}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {comment.createdBy?.name || comment.userName || 'Unknown User'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </p>
                          {comment.isInternal && (
                            <Badge variant="secondary" className="text-xs">
                              Internal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  {index < comments.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
