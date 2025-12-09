import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/errorUtils';

export const NewProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lifecycleType: 'NEW_ITEM' as const,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const project = await projectService.create(formData);
      toast({
        title: 'Success',
        description: 'Project created successfully!',
      });
      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground mt-2">Start a new item lifecycle project</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Fill in the details to create a new project</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifecycleType">Lifecycle Type *</Label>
              <Select
                value={formData.lifecycleType}
                onValueChange={(value) => setFormData({ ...formData, lifecycleType: value as any })}
                required
              >
                <SelectTrigger id="lifecycleType">
                  <SelectValue placeholder="Select lifecycle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW_ITEM">New Item</SelectItem>
                  <SelectItem value="TRANSITIONING_ITEM">Transitioning Item</SelectItem>
                  <SelectItem value="DELETING_ITEM">Deleting Item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
