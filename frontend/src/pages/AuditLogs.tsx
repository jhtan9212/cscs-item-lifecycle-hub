import { useState, useEffect, Fragment } from 'react';
import {
  auditLogService,
  type AuditLog,
  type AuditLogFilters,
  type FilterOptions,
} from '@/services/auditLogService';
import { projectService } from '@/services/projectService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getErrorMessage } from '@/lib/errorUtils';
import { formatDateTime } from '@/utils/formatters';
import type { Project } from '@/types/project';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AuditLogs = () => {
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: 50,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
    loadFilterOptions();
    loadProjects();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await auditLogService.getAll(filters);
      setAuditLogs(response.auditLogs);
      setTotal(response.total);
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

  const loadFilterOptions = async () => {
    try {
      const options = await auditLogService.getFilters();
      setFilterOptions(options);
    } catch (err: any) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      offset: 0,
    }));
  };

  const clearFilters = () => {
    setFilters({
      limit: 50,
      offset: 0,
    });
  };

  const handlePageChange = (newOffset: number) => {
    setFilters((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  };

  const parseChanges = (changes?: string): any => {
    if (!changes) return null;
    try {
      return JSON.parse(changes);
    } catch {
      return changes;
    }
  };

  const toggleRow = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading && auditLogs.length === 0) {
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
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            View system activity and changes. Total: {total} entries
          </p>
        </div>
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {showFilters && filterOptions && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter audit logs by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={filters.projectId || ''}
                  onValueChange={(value) => handleFilterChange('projectId', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.projectNumber} - {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>User</Label>
                <Select
                  value={filters.userId || ''}
                  onValueChange={(value) => handleFilterChange('userId', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Users</SelectItem>
                    {filterOptions.users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={filters.action || ''}
                  onValueChange={(value) => handleFilterChange('action', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    {filterOptions.actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select
                  value={filters.entityType || ''}
                  onValueChange={(value) => handleFilterChange('entityType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {filterOptions.entityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <p className="text-muted-foreground">No audit logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => {
                    const changes = parseChanges(log.changes);
                    const isExpanded = expandedRows.has(log.id);
                    return (
                      <Fragment key={log.id}>
                        <TableRow className="hover:bg-accent/50">
                          <TableCell className="whitespace-nowrap text-sm">
                            {formatDateTime(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium">
                                {log.user?.name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {log.user?.email} ({log.user?.role.name})
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.entityType}
                          </TableCell>
                          <TableCell>
                            {log.project ? (
                              <div>
                                <div className="text-sm font-medium">
                                  {log.project.projectNumber}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {log.project.name}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {changes ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRow(log.id)}
                                className="h-8"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="mr-2 h-4 w-4" />
                                    Hide Changes
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="mr-2 h-4 w-4" />
                                    View Changes
                                  </>
                                )}
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && changes && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/30">
                              <div className="p-4">
                                <pre className="text-xs overflow-auto max-h-96 bg-background border rounded-lg p-4">
                                  {JSON.stringify(changes, null, 2)}
                                </pre>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {total > (filters.limit || 50) && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filters.offset || 0} to{' '}
                {Math.min((filters.offset || 0) + (filters.limit || 50), total)} of {total} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(Math.max(0, (filters.offset || 0) - (filters.limit || 50)))
                  }
                  disabled={(filters.offset || 0) === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.offset || 0) + (filters.limit || 50))}
                  disabled={(filters.offset || 0) + (filters.limit || 50) >= total}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
