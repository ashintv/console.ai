'use client';

export const dynamic = 'force-dynamic';

import { Nav } from '@/components/nav';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { eventsApi, projectsApi, ApiError } from '@/lib/api';
import { CardSkeleton, ErrorListSkeleton, StatsSkeleton } from '@/components/loading-skeleton';
import { ErrorCard } from '@/components/error-card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export default function Dashboard() {
  const { token, user } = useAuth();
  const [errors, setErrors] = useState<Error[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch projects
        const projectsData = await projectsApi.list(token);
        setProjects(projectsData.projects || []);

        // Fetch recent events
        const eventsData = await eventsApi.list(token, {
          limit: 10,
          offset: 0,
        });
        setErrors(eventsData.events || []);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to load dashboard data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const StatCard = ({ icon: Icon, label, value, change }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col w-full">
        <Nav />
        <main className="flex-1 w-full">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-screen-2xl py-6 px-4">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                      Welcome, {user?.name || 'User'}! Overview of your error tracking and analysis
                    </p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Stats Grid */}
                {isLoading ? (
                  <StatsSkeleton />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      icon={AlertCircle}
                      label="Total Errors"
                      value={errors.length}
                      change={`${projects.length} active projects`}
                    />
                    <StatCard
                      icon={CheckCircle2}
                      label="Active Projects"
                      value={projects.length}
                      change={projects.length > 0 ? 'Ready to track' : 'Create first project'}
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Recent Errors"
                      value={errors.slice(0, 5).length}
                      change="Last 10 events"
                    />
                    <StatCard
                      icon={Clock}
                      label="Status"
                      value="Active"
                      change="Connected to API"
                    />
                  </div>
                )}

                {/* Tabs Section */}
                <Tabs defaultValue="errors" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="errors">Recent Errors</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                  </TabsList>

                  <TabsContent value="errors" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Errors</CardTitle>
                        <CardDescription>
                          Latest errors from your applications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <ErrorListSkeleton />
                        ) : errors.length === 0 ? (
                          <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No errors yet</p>
                            <p className="text-sm text-muted-foreground">
                              Errors will appear here once applications start reporting them
                            </p>
                          </div>
                        ) : (
                          errors.map((err, idx) => (
                            <ErrorCard
                              key={err.id}
                              error={err}
                              showDivider={idx < errors.length - 1}
                            />
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Projects</CardTitle>
                        <CardDescription>
                          Projects configured for error tracking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                              <CardSkeleton key={i} />
                            ))}
                          </div>
                        ) : projects.length === 0 ? (
                          <div className="text-center py-8">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No projects yet</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Create your first project to start tracking errors
                            </p>
                            <Button onClick={() => window.location.href = '/projects'}>
                              Create Project
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {projects.map((project) => (
                              <Card key={project.id} className="border-l-4 border-l-primary">
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-lg">{project.name}</CardTitle>
                                      {project.description && (
                                        <CardDescription>{project.description}</CardDescription>
                                      )}
                                    </div>
                                    <Badge variant="secondary">Active</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.href = `/projects/${project.id}`}
                                  >
                                    View Project
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
