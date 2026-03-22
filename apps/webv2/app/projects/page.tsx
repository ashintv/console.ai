'use client';

export const dynamic = 'force-dynamic';

import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { ProtectedRoute } from '@/components/protected-route';
import { useEffect, useState } from 'react';
import { projectsApi, eventsApi, ApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { CardSkeleton } from '@/components/loading-skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface ProjectWithErrors extends Project {
  errorCount: number;
}

export default function Projects() {
  const { token } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithErrors[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!token) return;
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const projectsData = await projectsApi.list(token!);
      const projectsWithErrors: ProjectWithErrors[] = [];

      // Fetch error count for each project
      for (const project of projectsData.projects || []) {
        try {
          const eventsData = await eventsApi.getByProject(project.id, token!);
          projectsWithErrors.push({
            ...project,
            errorCount: eventsData.events?.length || 0,
          });
        } catch {
          projectsWithErrors.push({
            ...project,
            errorCount: 0,
          });
        }
      }

      setProjects(projectsWithErrors);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load projects';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsCreating(true);
      await projectsApi.create(
        {
          name: formData.name,
          description: formData.description || undefined,
        },
        token!
      );
      setFormData({ name: '', description: '' });
      setIsDialogOpen(false);
      await fetchProjects();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to create project';
      setError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(projectId, token!);
      setDeleteConfirmId(null);
      await fetchProjects();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to delete project';
      setError(message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col w-full">
        <Nav />
        <main className="flex-1 w-full">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-screen-2xl py-6 px-4">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">
                      Manage your error tracking projects
                    </p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                          Create a new project to start tracking errors
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateProject} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Project Name *</Label>
                          <Input
                            id="name"
                            placeholder="My App"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            disabled={isCreating}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description (optional)</Label>
                          <Input
                            id="description"
                            placeholder="React/Next.js application"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            disabled={isCreating}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Project'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <Card>
                    <CardContent className="pt-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No projects yet</p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        Create Your First Project
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                      <Card key={project.id} className="flex flex-col">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle>{project.name}</CardTitle>
                              {project.description && (
                                <CardDescription>{project.description}</CardDescription>
                              )}
                            </div>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Active Errors</p>
                            <p className="text-2xl font-bold">{project.errorCount}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => router.push(`/projects/${project.id}`)}
                            >
                              View Project
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirmId(project.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All errors and data for this project will be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteProject(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
