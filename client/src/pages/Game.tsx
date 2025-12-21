import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PointerLockControls, Stars } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import { useGameStore } from '@/game/store';
import { Player } from '@/game/Player';
import { Weapon } from '@/game/Weapon';
import { Level } from '@/game/Level';
import { EnemyManager } from '@/game/Enemy';
import { Button } from '@/components/ui/button';
import { useSubmitScore, useScores } from '@/hooks/use-scores';
import { Loader2, Trophy, Skull } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function UI() {
  const { score, health, isGameOver, isPlaying, startGame, resetGame } = useGameStore();
  const { mutate: submitScore, isPending } = useSubmitScore();
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const { data: scores } = useScores();

  const handleStart = () => {
    // Request pointer lock
    const canvas = document.querySelector('canvas');
    canvas?.requestPointerLock();
    startGame();
  };

  const handleSubmit = () => {
    if (!username.trim()) {
      toast({ title: "Name required", description: "Please enter a name for the leaderboard", variant: "destructive" });
      return;
    }
    submitScore({ username, score }, {
      onSuccess: () => {
        toast({ title: "Score Saved!", description: `You ranked on the leaderboard!` });
        resetGame();
        setUsername("");
      }
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top HUD */}
      <div className="flex justify-between items-start w-full">
        <div className="hud-text text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
          SCORE: {score.toString().padStart(6, '0')}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="hud-text text-2xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            HEALTH: {health}%
          </div>
          <div className="w-48 h-4 bg-black/50 border border-red-900 skew-x-[-15deg]">
            <div 
              className="h-full bg-red-500 transition-all duration-300" 
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="crosshair" />
      <div className="vignette" />
      <div className="scanlines" />

      {/* Start/Game Over Overlay */}
      {(!isPlaying || isGameOver) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-auto backdrop-blur-sm z-50">
          <div className="bg-zinc-900/90 border border-cyan-500/30 p-8 rounded-lg max-w-2xl w-full shadow-[0_0_50px_rgba(0,255,255,0.1)]">
            <h1 className="text-6xl text-center mb-8 bg-gradient-to-t from-cyan-600 to-cyan-300 bg-clip-text text-transparent">
              {isGameOver ? "MISSION FAILED" : "NEON STRIKE"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Controls / Submission */}
              <div className="space-y-6">
                {isGameOver ? (
                  <div className="space-y-4">
                    <p className="text-2xl text-center text-white font-mono">FINAL SCORE: {score}</p>
                    <div className="space-y-2">
                      <Input 
                        placeholder="ENTER CALLSIGN" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="bg-black/50 border-cyan-900 font-mono text-cyan-400 uppercase tracking-widest"
                        maxLength={10}
                      />
                      <Button 
                        onClick={handleSubmit} 
                        disabled={isPending}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest"
                      >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : "UPLOAD DATA"}
                      </Button>
                      <Button 
                        onClick={resetGame} 
                        variant="outline"
                        className="w-full border-red-900 text-red-400 hover:bg-red-900/20"
                      >
                        RETRY MISSION
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="text-cyan-200/70 font-mono text-sm space-y-2 border border-cyan-900/30 p-4 bg-black/30 rounded">
                      <p>WASD to Move</p>
                      <p>SPACE to Jump</p>
                      <p>MOUSE to Look/Shoot</p>
                      <p>Eliminate targets. Survive.</p>
                    </div>
                    <Button 
                      onClick={handleStart}
                      className="w-full py-8 text-2xl bg-cyan-600 hover:bg-cyan-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                    >
                      INITIATE LINK
                    </Button>
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="border-l border-white/10 pl-8">
                <div className="flex items-center gap-2 mb-4 text-amber-400">
                  <Trophy className="w-5 h-5" />
                  <h3 className="text-lg font-bold">ELITE OPERATIVES</h3>
                </div>
                
                <div className="space-y-2 font-mono text-sm max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {scores?.sort((a,b) => b.score - a.score).slice(0, 10).map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5 hover:border-cyan-500/50 transition-colors">
                      <span className="text-cyan-300">#{i + 1} {s.username}</span>
                      <span className="text-white font-bold">{s.score}</span>
                    </div>
                  ))}
                  {(!scores || scores.length === 0) && (
                    <div className="text-white/30 text-center py-8">No records found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Game() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas shadows camera={{ fov: 75 }}>
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.1} />
          <Physics gravity={[0, -9.8, 0]}>
            <Player />
            <Weapon />
            <EnemyManager />
            <Level />
          </Physics>
          <PointerLockControls />
        </Suspense>
      </Canvas>
      <UI />
    </div>
  );
}
