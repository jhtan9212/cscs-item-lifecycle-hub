import { useState, useEffect } from 'react';
import { versionService, type ItemVersion, type ProjectVersion } from '@/services/versionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDateTime } from '@/utils/formatters';
import { History, FileText, Package } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';

interface VersionHistoryProps {
  entityType: 'item' | 'project';
  entityId: string;
}

export const VersionHistory = ({ entityType, entityId }: VersionHistoryProps) => {
  const [itemVersions, setItemVersions] = useState<ItemVersion[]>([]);
  const [projectVersions, setProjectVersions] = useState<ProjectVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ItemVersion | ProjectVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVersions();
  }, [entityType, entityId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      if (entityType === 'item') {
        const versions = await versionService.getItemVersions(entityId);
        setItemVersions(versions);
        if (versions.length > 0) {
          setSelectedVersion(versions[0]);
        }
      } else {
        const versions = await versionService.getProjectVersions(entityId);
        setProjectVersions(versions);
        if (versions.length > 0) {
          setSelectedVersion(versions[0]);
        }
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const versions = entityType === 'item' ? itemVersions : projectVersions;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No version history available</p>
        </CardContent>
      </Card>
    );
  }

  const parseVersionData = (data: string) => {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            {versions.length} version{versions.length !== 1 ? 's' : ''} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {versions.map((version) => (
                <Button
                  key={version.id}
                  variant={selectedVersion?.id === version.id ? 'default' : 'outline'}
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="flex items-center justify-between w-full">
                      <Badge variant="secondary">v{version.versionNumber}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(version.createdAt)}
                      </span>
                    </div>
                    {version.createdBy && (
                      <span className="text-xs text-muted-foreground">
                        by {version.createdBy.name}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {entityType === 'item' ? (
              <Package className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            Version {selectedVersion?.versionNumber} Details
          </CardTitle>
          <CardDescription>
            Created {selectedVersion && formatDateTime(selectedVersion.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedVersion && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Version Data</h4>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <pre className="text-xs">
                    {JSON.stringify(parseVersionData(selectedVersion.data), null, 2)}
                  </pre>
                </ScrollArea>
              </div>
              {selectedVersion.createdBy && (
                <div className="text-sm text-muted-foreground">
                  Created by: {selectedVersion.createdBy.name} ({selectedVersion.createdBy.email})
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

