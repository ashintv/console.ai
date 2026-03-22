'use client';

export const dynamic = 'force-dynamic';

import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { projectsApi, eventsApi, apiKeysApi, ApiError } from '@/lib/api';
import { CardSkeleton, ErrorListSkeleton } from '@/components/loading-skeleton';
import { ExpandableErrorCard } from '@/components/expandable-error-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { AlertCircle, ArrowLeft, Copy, Trash2, Check } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Error {
  id: string;
  message: string;
  source?: string;
  language?: string;
  framework?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  aiAnalysis?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export default function ProjectDetailsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [errors, setErrors] = useState<Error[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyLoading, setKeyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [isCreating, setIsCreating] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');

  useEffect(() => {
    if (!token || !projectId) return;
    fetchProjectData();
    fetchApiKeys();
  }, [token, projectId, page]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch project details
      const projectData = await projectsApi.get(projectId, token!);
      setProject(projectData.project);

      // Fetch errors for this project
      const eventsData = await eventsApi.getByProject(projectId, token!, {
        limit: pageSize,
        offset: page * pageSize,
      });
      setErrors(eventsData.events || []);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load project data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    if (!projectId || !token) return;
    try {
      setKeyLoading(true);
      const data = await apiKeysApi.list(projectId, token);

      // Handle different response formats
      let keys: ApiKey[] = [];

      if (Array.isArray(data)) {
        keys = data;
      } else if (data?.keys && Array.isArray(data.keys)) {
        keys = data.keys;
      } else if (data && typeof data === 'object') {
        // Try to find keys in any array property
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            keys = value;
            break;
          }
        }
      }

      setApiKeys(keys);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load API keys';
      console.error('Error fetching API keys:', err);
      setError(message);
      setApiKeys([]);
    } finally {
      setKeyLoading(false);
    }
  };

  const handleDeleteError = async (errorId: string) => {
    try {
      await eventsApi.delete(errorId, token!);
      setErrors(errors.filter((e) => e.id !== errorId));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to delete error';
      setError(message);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      setIsCreating(true);
      setError(null);
      console.log('Creating API key for project:', projectId);
      await apiKeysApi.create(projectId, keyName, token!);
      console.log('API key created successfully');

      setKeyName('');

      // Refetch immediately
      await fetchApiKeys();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to create API key';
      console.error('Error creating API key:', err);
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await apiKeysApi.delete(projectId, keyId, token!);
      await fetchApiKeys();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to delete API key';
      setError(message);
    }
  };

  const copyToClipboard = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen w-full">
        <Nav />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-screen-2xl py-6 px-4">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      {isLoading ? 'Loading...' : project?.name || 'Project'}
                    </h1>
                    {project?.description && (
                      <p className="text-muted-foreground">{project.description}</p>
                    )}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{isLoading ? '-' : errors.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">Active</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Latest Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {isLoading
                          ? '-'
                          : errors.length > 0
                            ? new Date(errors[0].createdAt).toLocaleDateString()
                            : 'No errors'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="errors" className="w-full">
                  <TabsList>
                    <TabsTrigger value="errors">Errors</TabsTrigger>
                    <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                  </TabsList>

                  <TabsContent value="errors" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Errors</CardTitle>
                        <CardDescription>
                          All errors tracked for this project
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <ErrorListSkeleton />
                        ) : errors.length === 0 ? (
                          <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No errors for this project yet</p>
                            <p className="text-sm text-muted-foreground">
                              Errors will appear here once applications start reporting them
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {errors.map((err, idx) => (
                              <ExpandableErrorCard
                                key={err.id}
                                error={err}
                                onDelete={handleDeleteError}
                                showDivider={idx < errors.length - 1}
                              />
                            ))}

                            {/* Pagination */}
                            <div className="flex justify-center gap-2 mt-6 pt-4 border-t">
                              <Button
                                variant="outline"
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                              >
                                Previous
                              </Button>
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                Page {page + 1}
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setPage(page + 1)}
                                disabled={errors.length < pageSize}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="api-keys" className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">API Keys</h2>
                      <p className="text-muted-foreground mb-4">
                        Manage API keys for this project
                      </p>
                    </div>

                    {/* Create Key Form Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Create New Key</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleCreateKey} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newKeyName">Key Name</Label>
                            <Input
                              id="newKeyName"
                              placeholder="e.g., Production"
                              value={keyName}
                              onChange={(e) => setKeyName(e.target.value)}
                              disabled={isCreating}
                            />
                          </div>
                          <Button type="submit" disabled={isCreating || !keyName.trim()}>
                            {isCreating ? 'Creating...' : 'Create API Key'}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Keys List */}
                    {keyLoading ? (
                      <CardSkeleton />
                    ) : apiKeys.length === 0 ? (
                      <Card>
                        <CardContent className="pt-8 text-center">
                          <p className="text-muted-foreground">
                            No API keys yet. Create one above to get started.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Your API Keys ({apiKeys.length})</h3>
                        {apiKeys.map((key) => (
                          <Card key={key.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">{key.name}</CardTitle>
                                  <CardDescription>
                                    Created {new Date(key.createdAt).toLocaleDateString()}
                                  </CardDescription>
                                </div>
                                <Badge variant={key.isActive ? 'default' : 'secondary'}>
                                  {key.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Input
                                    readOnly
                                    value={key.key}
                                    className="flex-1 font-mono text-sm bg-muted"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(key.key, key.id)}
                                    title="Copy to clipboard"
                                  >
                                    {copiedKeyId === key.id ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Last Used</p>
                                    <p className="font-medium">
                                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                                    </p>
                                  </div>
                                  <div className="flex justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteKey(key.id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
