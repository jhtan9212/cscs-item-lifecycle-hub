import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Project } from '../types/project';
import type { Item } from '../types/item';
import { projectService } from '../services/projectService';
import { itemService } from '../services/itemService';
import { WorkflowTimeline } from '../components/workflow/WorkflowTimeline';
import { WorkflowControls } from '../components/workflow/WorkflowControls';
import { ItemList } from '../components/items/ItemList';
import { ItemForm } from '../components/items/ItemForm';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/formatters';

export const ProjectDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'workflow'>('overview');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    if (id) {
      loadProject();
      loadItems();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(id!);
      setProject(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      if (id) {
        const data = await itemService.getByProject(id);
        setItems(data);
      }
    } catch (err: any) {
      console.error('Failed to load items:', err);
    }
  };

  const handleAdvanceWorkflow = async (comment?: string) => {
    if (!id) return;
    try {
      await projectService.advanceWorkflow(id, comment);
      await loadProject();
    } catch (err: any) {
      alert(err.message || 'Failed to advance workflow');
      throw err;
    }
  };

  const handleMoveBackWorkflow = async (comment?: string) => {
    if (!id) return;
    try {
      await projectService.moveBackWorkflow(id, comment);
      await loadProject();
    } catch (err: any) {
      alert(err.message || 'Failed to move back workflow');
      throw err;
    }
  };

  const handleCreateItem = async (data: Partial<Item>) => {
    if (!id) return;
    try {
      await itemService.create(id, data);
      await loadItems();
      setShowItemForm(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(err.message || 'Failed to create item');
      throw err;
    }
  };

  const handleUpdateItem = async (data: Partial<Item>) => {
    if (!editingItem) return;
    try {
      await itemService.update(editingItem.id, data);
      await loadItems();
      setShowItemForm(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update item');
      throw err;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemService.delete(itemId);
      await loadItems();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Project not found'}</p>
        <Button onClick={() => navigate('/projects')} className="mt-4" variant="outline">
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button onClick={() => navigate('/projects')} variant="outline" size="sm" className="mb-4">
          ← Back to Projects
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-500 mt-1">
          {project.projectNumber} • Created {formatDate(project.createdAt)}
        </p>
      </div>

      <div className="mb-6 border-b">
        <nav className="flex space-x-4">
          {(['overview', 'items', 'workflow'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Project Number</p>
                <p className="font-medium">{project.projectNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{project.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lifecycle Type</p>
                <p className="font-medium">{project.lifecycleType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Stage</p>
                <p className="font-medium">{project.currentStage}</p>
              </div>
            </div>
            {project.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1">{project.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-6">
          {showItemForm ? (
            <ItemForm
              item={editingItem || undefined}
              projectId={project.id}
              onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
              onCancel={() => {
                setShowItemForm(false);
                setEditingItem(null);
              }}
            />
          ) : (
            <ItemList
              items={items}
              onEdit={(item) => {
                setEditingItem(item);
                setShowItemForm(true);
              }}
              onDelete={handleDeleteItem}
              onCreateNew={() => setShowItemForm(true)}
            />
          )}
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="space-y-6">
          {project.workflowSteps && (
            <WorkflowTimeline
              steps={project.workflowSteps}
              currentStage={project.currentStage}
            />
          )}
          <WorkflowControls
            projectId={project.id}
            currentStage={project.currentStage}
            canAdvance={project.status !== 'COMPLETED'}
            canMoveBack={true}
            onAdvance={handleAdvanceWorkflow}
            onMoveBack={handleMoveBackWorkflow}
          />
        </div>
      )}
    </div>
  );
};

