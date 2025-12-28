import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Box, Image, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

const textTo3DSchema = z.object({
  prompt: z.string().min(1, "Please describe the 3D model you want to create"),
  artStyle: z.enum(["realistic", "cartoon", "hand-painted", "fantasy", "sculpture"]),
});

type TextTo3DFormData = z.infer<typeof textTo3DSchema>;

interface TaskStatus {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  progress: number;
  modelUrls?: {
    glb?: string;
    fbx?: string;
    obj?: string;
    usdz?: string;
  };
  thumbnailUrl?: string;
}

export default function AssetGenerator() {
  const { toast } = useToast();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const form = useForm<TextTo3DFormData>({
    resolver: zodResolver(textTo3DSchema),
    defaultValues: {
      prompt: "",
      artStyle: "realistic",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: TextTo3DFormData) => {
      const response = await fetch('/api/meshy/text-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Generation failed');
      }
      return response.json() as Promise<{ taskId: string }>;
    },
    onSuccess: (data) => {
      setActiveTaskId(data.taskId);
      toast({
        title: "Generation started",
        description: "Your 3D model is being generated. This may take about 60 seconds.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const taskStatusQuery = useQuery<TaskStatus>({
    queryKey: ['/api/meshy/task', activeTaskId],
    queryFn: async () => {
      const response = await fetch(`/api/meshy/task/${activeTaskId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch status');
      }
      return response.json();
    },
    enabled: !!activeTaskId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "SUCCEEDED" || data?.status === "FAILED") {
        return false;
      }
      return 3000;
    },
  });

  const onSubmit = (data: TextTo3DFormData) => {
    generateMutation.mutate(data);
  };

  const taskStatus = taskStatusQuery.data;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="stranger-title text-4xl text-red-500">Asset Generator</h1>
            <p className="text-muted-foreground">Create 3D models using Meshy.ai</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5" />
                Text to 3D
              </CardTitle>
              <CardDescription>
                Describe what you want to create and generate a 3D model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="A monster mask with glowing eyes..."
                            data-testid="input-prompt"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="artStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Art Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-art-style">
                              <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="realistic">Realistic</SelectItem>
                            <SelectItem value="cartoon">Cartoon</SelectItem>
                            <SelectItem value="hand-painted">Hand-painted</SelectItem>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                            <SelectItem value="sculpture">Sculpture</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={generateMutation.isPending}
                    className="w-full"
                    data-testid="button-generate"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Box className="w-4 h-4 mr-2" />
                        Generate 3D Model
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generation Status</CardTitle>
              <CardDescription>
                {activeTaskId ? "Tracking your generation progress" : "Start a generation to see status"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeTaskId && (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No active generation</p>
                </div>
              )}

              {activeTaskId && taskStatus && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        taskStatus.status === "SUCCEEDED"
                          ? "default"
                          : taskStatus.status === "FAILED"
                          ? "destructive"
                          : "secondary"
                      }
                      data-testid="badge-status"
                    >
                      {taskStatus.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span data-testid="text-progress">{taskStatus.progress}%</span>
                    </div>
                    <Progress value={taskStatus.progress} data-testid="progress-bar" />
                  </div>

                  {taskStatus.status === "IN_PROGRESS" && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}

                  {taskStatus.status === "SUCCEEDED" && taskStatus.modelUrls && (
                    <div className="space-y-3">
                      {taskStatus.thumbnailUrl && (
                        <img
                          src={taskStatus.thumbnailUrl}
                          alt="Generated model preview"
                          className="w-full rounded-md border"
                          data-testid="img-preview"
                        />
                      )}
                      <div className="flex flex-wrap gap-2">
                        {taskStatus.modelUrls.glb && (
                          <a href={taskStatus.modelUrls.glb} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" data-testid="button-download-glb">
                              <Download className="w-3 h-3 mr-1" />
                              GLB
                            </Button>
                          </a>
                        )}
                        {taskStatus.modelUrls.fbx && (
                          <a href={taskStatus.modelUrls.fbx} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" data-testid="button-download-fbx">
                              <Download className="w-3 h-3 mr-1" />
                              FBX
                            </Button>
                          </a>
                        )}
                        {taskStatus.modelUrls.obj && (
                          <a href={taskStatus.modelUrls.obj} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" data-testid="button-download-obj">
                              <Download className="w-3 h-3 mr-1" />
                              OBJ
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {taskStatus.status === "FAILED" && (
                    <div className="text-center py-4 text-destructive">
                      <p>Generation failed. Please try again.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTaskId && taskStatusQuery.isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
