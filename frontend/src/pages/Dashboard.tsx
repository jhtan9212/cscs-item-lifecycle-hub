import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { dashboardService, type DashboardStats } from '@/services/dashboardService';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatters';
import { FolderKanban, CheckSquare, Bell, TrendingUp, FileText } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats().catch(() => null);
      if (data) {
        setStats(data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    className,
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    description?: string;
    className?: string;
  }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mt-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">
          Item Lifecycle Hub Platform - {user?.role.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Projects"
              value={stats?.totalProjects || 0}
              icon={FolderKanban}
            />
            <StatCard
              title="Active Projects"
              value={stats?.activeProjects || 0}
              icon={TrendingUp}
              className="border-green-200 dark:border-green-800"
            />
            <StatCard
              title="Pending Tasks"
              value={stats?.pendingTasks || 0}
              icon={CheckSquare}
              className="border-yellow-200 dark:border-yellow-800"
            />
            <StatCard
              title="Unread Notifications"
              value={stats?.unreadNotifications || 0}
              icon={Bell}
              className="border-red-200 dark:border-red-800"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              My Tasks
            </CardTitle>
            <CardDescription>Projects requiring your action</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/my-tasks">
              <Button className="w-full">View My Tasks</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Projects
            </CardTitle>
            <CardDescription>Manage item lifecycle projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/projects">
              <Button className="w-full">View Projects</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Workflow
            </CardTitle>
            <CardDescription>Track project workflow stages</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/projects">
              <Button className="w-full" variant="outline">
                View Workflows
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      {stats?.recentProjects && stats.recentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your recently accessed projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentProjects.map((project: any) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.projectNumber} • {formatDate(project.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        project.status === 'COMPLETED'
                          ? 'default'
                          : project.status === 'IN_PROGRESS'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="ml-2 shrink-0"
                    >
                      {project.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link to="/projects/new">
              <Button>Create New Project</Button>
            </Link>
            {user?.role.isAdmin && (
              <Link to="/role-management">
                <Button variant="outline">Manage Roles</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
