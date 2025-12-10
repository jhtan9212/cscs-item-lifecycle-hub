import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { dashboardService, type DashboardStats } from '@/services/dashboardService';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatters';
import { FolderKanban, CheckSquare, Bell, TrendingUp, FileText, BarChart3, PieChart, LineChart as LineChartIcon, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';

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

      {stats && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.keys(stats.projectsByStatus).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Projects by Status
                  </CardTitle>
                  <CardDescription>Distribution of projects across different statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={Object.entries(stats.projectsByStatus).map(([status, count]) => ({
                        status: status.replace('_', ' '),
                        count,
                        fill: status === 'COMPLETED' 
                          ? 'hsl(142, 76%, 36%)' 
                          : status === 'IN_PROGRESS'
                          ? 'hsl(217, 91%, 60%)'
                          : 'hsl(var(--muted-foreground))',
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="status" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        stroke="hsl(var(--border))"
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        stroke="hsl(var(--border))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#statusGradient)"
                        radius={[8, 8, 0, 0]}
                        stroke="hsl(var(--primary))"
                        strokeWidth={1}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {Object.keys(stats.projectsByLifecycle).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Projects by Lifecycle Type
                  </CardTitle>
                  <CardDescription>Distribution of projects across lifecycle types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <RechartsPieChart>
                      <Pie
                        data={Object.entries(stats.projectsByLifecycle).map(([lifecycle, count]) => ({
                          name: lifecycle.replace(/_/g, ' '),
                          value: count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => 
                          `${name}: ${value} (${((percent || 0) * 100).toFixed(1)}%)`
                        }
                        outerRadius={100}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.entries(stats.projectsByLifecycle).map((_, index) => {
                          const colors = [
                            'hsl(217, 91%, 60%)',  // Blue
                            'hsl(142, 76%, 36%)',  // Green
                            'hsl(38, 92%, 50%)',   // Yellow/Orange
                            'hsl(0, 84%, 60%)',    // Red
                            'hsl(280, 100%, 70%)', // Purple
                            'hsl(199, 89%, 48%)',  // Cyan
                          ];
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                              stroke="hsl(var(--card))"
                              strokeWidth={2}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                        formatter={(value: number, name: string) => [value, name]}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Project Overview
                </CardTitle>
                <CardDescription>Total, active, and completed projects comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart
                    data={[
                      {
                        category: 'Projects',
                        total: stats.totalProjects,
                        active: stats.activeProjects,
                        completed: stats.completedProjects,
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '10px' }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="hsl(217, 91%, 60%)" 
                      name="Total Projects"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      dataKey="active" 
                      fill="hsl(142, 76%, 36%)" 
                      name="Active Projects"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="hsl(38, 92%, 50%)" 
                      name="Completed Projects"
                      radius={[8, 8, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Project Completion Rate
                </CardTitle>
                <CardDescription>Visualization of project completion metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={[
                      {
                        name: 'Total',
                        value: stats.totalProjects,
                        fill: 'hsl(217, 91%, 60%)',
                      },
                      {
                        name: 'Active',
                        value: stats.activeProjects,
                        fill: 'hsl(142, 76%, 36%)',
                      },
                      {
                        name: 'Completed',
                        value: stats.completedProjects,
                        fill: 'hsl(38, 92%, 50%)',
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(38, 92%, 50%)"
                      strokeWidth={2}
                      fill="url(#completionGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalProjects}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.activeProjects}
                    </p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.completedProjects}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Task Overview
                </CardTitle>
                <CardDescription>Pending tasks and notifications summary</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      {
                        name: 'Tasks',
                        pending: stats.pendingTasks,
                        completed: (stats.totalProjects || 0) - stats.pendingTasks,
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      stroke="hsl(var(--border))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="pending" 
                      fill="hsl(38, 92%, 50%)" 
                      name="Pending Tasks"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      dataKey="completed" 
                      fill="hsl(142, 76%, 36%)" 
                      name="Completed Tasks"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Status
                </CardTitle>
                <CardDescription>Unread notifications overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[250px]">
                  <div className="text-center">
                    <div className="relative w-48 h-48 mx-auto">
                      <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke="hsl(var(--muted))"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          stroke={stats.unreadNotifications > 0 ? "hsl(0, 84%, 60%)" : "hsl(142, 76%, 36%)"}
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(stats.unreadNotifications / Math.max(stats.totalProjects, 1)) * 502.4} 502.4`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <p className="text-4xl font-bold">
                            {stats.unreadNotifications}
                          </p>
                          <p className="text-sm text-muted-foreground">Unread</p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {stats.unreadNotifications === 0 
                        ? 'All caught up!' 
                        : `${stats.unreadNotifications} notification${stats.unreadNotifications !== 1 ? 's' : ''} require attention`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
