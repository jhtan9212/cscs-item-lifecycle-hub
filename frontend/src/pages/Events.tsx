import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, type LifecycleEvent, type EventFilters } from '@/services/eventService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/utils/formatters';
import { Activity, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Events = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [filters, setFilters] = useState<EventFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState({
    entityType: '',
    entityId: '',
    eventType: '',
    status: '',
    limit: '50',
  });

  useEffect(() => {
    loadFilters();
    loadEvents();
  }, []);

  const loadFilters = async () => {
    try {
      const data = await eventService.getFilters();
      setFilters(data);
    } catch (err: any) {
      console.error('Failed to load filters:', err);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterState.entityType) params.entityType = filterState.entityType;
      if (filterState.entityId) params.entityId = filterState.entityId;
      if (filterState.eventType) params.eventType = filterState.eventType;
      if (filterState.status) params.status = filterState.status;
      if (filterState.limit) params.limit = parseInt(filterState.limit, 10);

      const data = await eventService.getAll(params);
      setEvents(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    // Convert placeholder value back to empty string
    const actualValue = value === '__all__' ? '' : value;
    setFilterState((prev) => ({ ...prev, [key]: actualValue }));
  };

  const handleApplyFilters = () => {
    loadEvents();
  };

  const handleClearFilters = () => {
    setFilterState({
      entityType: '',
      entityId: '',
      eventType: '',
      status: '',
      limit: '50',
    });
    setTimeout(loadEvents, 100);
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      WORKFLOW_ADVANCED: 'Workflow Advanced',
      WORKFLOW_MOVED_BACK: 'Workflow Moved Back',
      ITEM_UPDATED: 'Item Updated',
      PROJECT_UPDATED: 'Project Updated',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const parsePayload = (payload: string) => {
    try {
      return JSON.parse(payload);
    } catch {
      return {};
    }
  };

  if (loading && !events.length) {
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
          <h1 className="text-3xl font-bold tracking-tight">Lifecycle Events</h1>
          <p className="text-muted-foreground mt-2">View and filter system lifecycle events</p>
        </div>
        <Button onClick={loadEvents} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filters && (
              <>
                <div>
                  <Label htmlFor="entityType">Entity Type</Label>
                  <Select
                    value={filterState.entityType || '__all__'}
                    onValueChange={(value) => handleFilterChange('entityType', value)}
                  >
                    <SelectTrigger id="entityType">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Types</SelectItem>
                      {filters.entityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select
                    value={filterState.eventType || '__all__'}
                    onValueChange={(value) => handleFilterChange('eventType', value)}
                  >
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Events</SelectItem>
                      {filters.eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getEventTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filterState.status || '__all__'}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Statuses</SelectItem>
                      {filters.statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="entityId">Entity ID</Label>
                  <Input
                    id="entityId"
                    placeholder="Entity ID"
                    value={filterState.entityId}
                    onChange={(e) => handleFilterChange('entityId', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="limit">Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="50"
                    value={filterState.limit}
                    onChange={(e) => handleFilterChange('limit', e.target.value)}
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button onClick={handleApplyFilters} className="flex-1">
                    Apply
                  </Button>
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No events found</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const payload = parsePayload(event.payload);
            return (
              <Card
                key={event.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  event.status === 'FAILED' ? 'border-l-4 border-l-red-500' : ''
                }`}
                onClick={() => {
                  if (event.entityType === 'PROJECT' && event.entityId) {
                    navigate(`/projects/${event.entityId}`);
                  } else if (event.entityType === 'ITEM' && payload.projectId) {
                    navigate(`/projects/${payload.projectId}`);
                  }
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{getEventTypeLabel(event.eventType)}</h3>
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {event.entityType}: {event.entityId}
                        </span>
                        <span>                        {formatDateTime(event.createdAt)}</span>
                        {event.processedAt && (
                          <span>Processed: {formatDateTime(event.processedAt)}</span>
                        )}
                      </div>
                      {event.errorMessage && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Error: {event.errorMessage}
                        </div>
                      )}
                      {payload.data && (
                        <div className="text-sm text-muted-foreground">
                          <ScrollArea className="h-24 rounded-md border p-2">
                            <pre className="text-xs">
                              {JSON.stringify(payload.data, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

