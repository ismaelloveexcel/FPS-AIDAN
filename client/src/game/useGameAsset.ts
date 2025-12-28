import { useState, useEffect, useRef } from 'react';

interface GameAsset {
  id: number;
  name: string;
  category: string;
  status: string;
  localPath: string | null;
}

export function useGameAssetPath(assetName: string): string | null {
  const [assetPath, setAssetPath] = useState<string | null>(null);
  const hasCompleted = useRef(false);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    async function checkAsset() {
      if (hasCompleted.current) return;
      
      try {
        const response = await fetch(`/api/game-assets/${assetName}/status`);
        if (response.ok) {
          const asset: GameAsset = await response.json();
          if (mounted && asset.status === 'completed' && asset.localPath) {
            setAssetPath(asset.localPath);
            hasCompleted.current = true;
            if (intervalId) {
              clearInterval(intervalId);
            }
          }
        }
      } catch {
        // Silently fail - will use fallback geometry
      }
    }

    checkAsset();
    
    // Poll every 10 seconds if not yet completed
    intervalId = setInterval(checkAsset, 10000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [assetName]);

  return assetPath;
}
