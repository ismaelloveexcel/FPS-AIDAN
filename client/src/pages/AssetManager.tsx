import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Loader2, RefreshCw, Play, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface GameAsset {
  id: number;
  name: string;
  category: string;
  prompt: string;
  meshyTaskId: string | null;
  status: string;
  modelUrl: string | null;
  thumbnailUrl: string | null;
  localPath: string | null;
  createdAt: string;
  progress?: number;
}

export default function AssetManager() {
  const { toast } = useToast();
  const [pollingAssets, setPollingAssets] = useState<Set<string>>(new Set());

  const assetsQuery = useQuery<GameAsset[]>({
    queryKey: ['/api/game-assets'],
    queryFn: async () => {
      const response = await fetch('/api/game-assets');
      if (!response.ok) throw new Error('Failed to fetch assets');
      return response.json();
    },
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/game-assets/initialize', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to initialize assets');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-assets'] });
      toast({ title: "Assets initialized", description: "Asset entries have been created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const generateAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/game-assets/generate-all', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start generation');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-assets'] });
      const started = data.results.filter((r: any) => r.status === 'started').length;
      toast({ 
        title: "Generation started", 
        description: `Started generating ${started} assets` 
      });
      data.results.forEach((r: any) => {
        if (r.status === 'started') {
          setPollingAssets(prev => new Set(prev).add(r.name));
        }
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const generateAssetMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/game-assets/${name}/generate`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to start generation');
      return response.json();
    },
    onSuccess: (data, name) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-assets'] });
      toast({ title: "Generation started", description: `Generating ${name}...` });
      setPollingAssets(prev => new Set(prev).add(name));
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (pollingAssets.size === 0) return;

    const pollInterval = setInterval(async () => {
      const newPolling = new Set(pollingAssets);
      
      for (const name of Array.from(pollingAssets)) {
        try {
          const response = await fetch(`/api/game-assets/${name}/status`);
          if (response.ok) {
            const asset = await response.json();
            if (asset.status === 'completed' || asset.status === 'failed') {
              newPolling.delete(name);
              queryClient.invalidateQueries({ queryKey: ['/api/game-assets'] });
              
              if (asset.status === 'completed') {
                toast({ 
                  title: "Asset ready", 
                  description: `${name} has been generated successfully` 
                });
              } else {
                toast({ 
                  title: "Generation failed", 
                  description: `${name} failed to generate`,
                  variant: "destructive"
                });
              }
            }
          }
        } catch (err) {
          console.error(`Error polling ${name}:`, err);
        }
      }
      
      setPollingAssets(newPolling);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [pollingAssets, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Ready</Badge>;
      case 'generating':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const groupedAssets = assetsQuery.data?.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, GameAsset[]>) || {};

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Game Asset Manager</h1>
            <p className="text-muted-foreground">Generate and manage 3D models for the game</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => initializeMutation.mutate()}
            disabled={initializeMutation.isPending}
            data-testid="button-initialize"
          >
            {initializeMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Initialize Assets
          </Button>
          
          <Button 
            onClick={() => generateAllMutation.mutate()}
            disabled={generateAllMutation.isPending}
            variant="default"
            data-testid="button-generate-all"
          >
            {generateAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Generate All Assets
          </Button>
          
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/game-assets'] })}
            variant="outline"
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {assetsQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {Object.entries(groupedAssets).map(([category, assets]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold capitalize">{category} Assets</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <Card key={asset.id} data-testid={`card-asset-${asset.name}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{asset.name.replace(/_/g, ' ')}</CardTitle>
                      {getStatusBadge(asset.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardDescription className="line-clamp-2">{asset.prompt}</CardDescription>
                    
                    {asset.thumbnailUrl && (
                      <img 
                        src={asset.thumbnailUrl} 
                        alt={asset.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    
                    {asset.status === 'generating' && pollingAssets.has(asset.name) && (
                      <Progress value={50} className="h-2" />
                    )}
                    
                    {asset.localPath && (
                      <p className="text-sm text-muted-foreground">
                        Saved: {asset.localPath}
                      </p>
                    )}
                    
                    {asset.status !== 'completed' && asset.status !== 'generating' && (
                      <Button 
                        size="sm"
                        onClick={() => generateAssetMutation.mutate(asset.name)}
                        disabled={generateAssetMutation.isPending}
                        data-testid={`button-generate-${asset.name}`}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {!assetsQuery.isLoading && (!assetsQuery.data || assetsQuery.data.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No assets found. Click "Initialize Assets" to create asset entries.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
