import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService, type Task } from '../services/taskService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const Tasks: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getUserTasks();
      setTasks(data);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId);
      await loadTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to complete task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.status === 'PENDING';
    if (filter === 'completed') return task.status === 'COMPLETED';
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-2">
          Tasks assigned to you across all projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 font-medium ${
              filter === 'pending'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 font-medium ${
              filter === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed ({completedCount})
          </button>
        </nav>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">
            {filter === 'pending' ? 'No pending tasks' : filter === 'completed' ? 'No completed tasks' : 'No tasks'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                task.status === 'PENDING' ? 'border-l-4 border-yellow-600' : 'border-l-4 border-green-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      task.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {task.dueDate && (
                      <span>
                        Due: {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.project && (
                      <span>
                        Project: {task.project.name}
                      </span>
                    )}
                    {task.completedAt && (
                      <span>
                        Completed: {formatDate(task.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {task.status === 'PENDING' && (
                    <Button
                      onClick={() => handleCompleteTask(task.id)}
                      variant="primary"
                      size="sm"
                    >
                      Complete
                    </Button>
                  )}
                  {task.project && (
                    <Button
                      onClick={() => navigate(`/projects/${task.projectId}`)}
                      variant="outline"
                      size="sm"
                    >
                      View Project
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

