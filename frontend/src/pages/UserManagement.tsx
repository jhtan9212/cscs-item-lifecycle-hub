import { useState, useEffect } from 'react';
import { userService, type User, type CreateUserData } from '@/services/userService';
import { roleService, type Role } from '@/services/roleService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/formatters';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, UserX, UserCheck, AlertCircle, Loader2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    roleId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        userService.getAll(),
        roleService.getAll(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await userService.create(formData);
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '', roleId: '' });
      await loadData();
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create user');
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message || 'Failed to create user',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    setError(null);
    try {
      await userService.update(userId, updates);
      setEditingUser(null);
      await loadData();
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update user');
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message || 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }
    setError(null);
    try {
      await userService.deactivate(userId);
      await loadData();
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to deactivate user');
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message || 'Failed to deactivate user',
        variant: 'destructive',
      });
    }
  };

  const handleActivate = async (userId: string) => {
    setError(null);
    try {
      await userService.activate(userId);
      await loadData();
      toast({
        title: 'Success',
        description: 'User activated successfully',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to activate user');
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message || 'Failed to activate user',
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage users, roles, and access permissions</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.roleId}
                    onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                    required
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && !showCreateForm && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    'hover:bg-accent/50 transition-colors',
                    !user.isActive && 'opacity-60'
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary">{user.role.name}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {editingUser?.id === user.id ? (
                        <UserEditForm
                          user={user}
                          roles={roles}
                          onSave={(updates) => handleUpdateUser(user.id, updates)}
                          onCancel={() => setEditingUser(null)}
                        />
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          {user.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivate(user.id)}
                              disabled={currentUser?.id === user.id}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(user.id)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

interface UserEditFormProps {
  user: User;
  roles: Role[];
  onSave: (updates: Partial<User>) => void;
  onCancel: () => void;
}

const UserEditForm = ({ user, roles, onSave, onCancel }: UserEditFormProps) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [roleId, setRoleId] = useState(user.roleId);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, email, roleId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-8 w-32 text-sm"
        required
        disabled={saving}
      />
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-8 w-40 text-sm"
        required
        disabled={saving}
      />
      <Select value={roleId} onValueChange={setRoleId} disabled={saving}>
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </form>
  );
};
