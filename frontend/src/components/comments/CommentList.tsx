import { useState } from 'react';
import type { FC } from 'react';
import type { Comment } from '../../types/project';
import { commentService } from '../../services/commentService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface CommentListProps {
  projectId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export const CommentList: FC<CommentListProps> = ({ projectId, comments, onCommentAdded }) => {
  const { user } = useAuth();
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
    } catch (error: any) {
      alert(error.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Comment Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Comment</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment about this project..."
              required
            />
          </div>
          <Button type="submit" isLoading={loading} disabled={!newComment.trim()}>
            Add Comment
          </Button>
        </form>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Comments ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {comment.createdBy?.name || comment.userName || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                      {comment.isInternal && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          Internal
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

