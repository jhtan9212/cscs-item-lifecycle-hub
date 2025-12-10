import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Project } from '@/types/project';
import type { Item } from '@/types/item';
import { projectService } from '@/services/projectService';
import { itemService } from '@/services/itemService';
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline';
import { WorkflowControls } from '@/components/workflow/WorkflowControls';
import { ItemList } from '@/components/items/ItemList';
import { ItemForm } from '@/components/items/ItemForm';
import { CommentList } from '@/components/comments/CommentList';
import { VersionHistory } from '@/components/versions/VersionHistory';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@/utils/formatters';
import { usePermissions } from '@/hooks/usePermissions';
import { commentService } from '@/services/commentService';
import type { Comment } from '@/types/project';
import { ArrowLeft, AlertCircle, Info, History } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/errorUtils';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'workflow' | 'comments' | 'versions'>(
    'overview'
  );
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (id) {
      loadProject();
      loadItems();
      loadComments();
    }
  }, [id]);

  const loadComments = async () => {
    try {
      if (id) {
        const data = await commentService.getByProject(id);
        setComments(data);
      }
    } catch (err: any) {
      console.error('Failed to load comments:', err);
    }
  };

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(id!);
      setProject(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
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
      toast({
        title: 'Workflow Advanced',
        description: 'The workflow has been successfully advanced to the next stage.',
      });
      // Redirect to My Tasks page after successful workflow advancement
      navigate('/my-tasks');
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const handleMoveBackWorkflow = async (comment?: string) => {
    if (!id) return;
    try {
      await projectService.moveBackWorkflow(id, comment);
      await loadProject();
      toast({
        title: 'Workflow Moved Back',
        description: 'The workflow has been successfully moved back to the previous stage.',
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const handleCreateItem = async (data: Partial<Item>) => {
    if (!id) return;
    try {
      await itemService.create(id, data);
      await loadItems();
      setShowItemForm(false);
      toast({
        title: 'Item Created',
        description: 'The item has been successfully created.',
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
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
      toast({
        title: 'Item Updated',
        description: 'The item has been successfully updated.',
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemService.delete(itemId);
      await loadItems();
      toast({
        title: 'Item Deleted',
        description: 'The item has been successfully deleted.',
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Error: {error || 'Project not found'}</span>
          <Button
            onClick={() => navigate('/projects')}
            variant="outline"
            size="sm"
            className="ml-4"
          >
            Back to Projects
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button onClick={() => navigate('/projects')} variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-2">
            {project.projectNumber} • Created {formatDate(project.createdAt)}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="comments">
            Comments
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {comments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="versions">
            <History className="mr-2 h-4 w-4" />
            Version History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project Number</p>
                  <p className="font-medium">{project.projectNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lifecycle Type</p>
                  <p className="font-medium">{project.lifecycleType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Stage</p>
                  <Badge>{project.currentStage}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Organization</p>
                  <p className="font-medium">{project.organization?.name || 'No Organization'}</p>
                </div>
              </div>
              {project.description && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          {project.workflowSteps && (
            <WorkflowTimeline 
              steps={project.workflowSteps} 
              currentStage={project.currentStage}
              lifecycleType={project.lifecycleType}
            />
          )}

          {/* Role-specific workflow actions */}
          {project.currentStage === 'KINEXO Pricing' && hasPermission('SUBMIT_PRICING') && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  This project is at the KINEXO Pricing stage. Use the dedicated pricing interface
                  to review and submit pricing.
                </span>
                <Button
                  onClick={() => navigate(`/projects/${project.id}/pricing`)}
                  className="ml-4"
                  size="sm"
                >
                  Open Pricing Interface
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {project.currentStage === 'Freight Strategy' && hasPermission('UPDATE_ITEM') && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  This project is at the Freight Strategy stage. Use the dedicated logistics
                  interface to set freight strategy.
                </span>
                <Button
                  onClick={() => navigate(`/projects/${project.id}/freight`)}
                  className="ml-4"
                  size="sm"
                >
                  Open Freight Strategy Interface
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <WorkflowControls
            projectId={project.id}
            currentStage={project.currentStage}
            canAdvance={project.status !== 'COMPLETED'}
            canMoveBack={true}
            onAdvance={handleAdvanceWorkflow}
            onMoveBack={handleMoveBackWorkflow}
          />
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <CommentList projectId={project.id} comments={comments} onCommentAdded={loadComments} />
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <VersionHistory entityType="project" entityId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
