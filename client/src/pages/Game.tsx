import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PointerLockControls } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import { useGameStore, LEVEL_CONFIG } from '@/game/store';
import { Player } from '@/game/Player';
import { Weapon } from '@/game/Weapon';
import { Level } from '@/game/Level';
import { EnemyManager } from '@/game/Enemy';
import { BossManager } from '@/game/Boss';
import { Button } from '@/components/ui/button';
import { useSubmitScore, useScores } from '@/hooks/use-scores';
import { Loader2, Trophy, Skull, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Boss health bar component
function BossHealthBar() {
  const boss = useGameStore(state => state.boss);
  const currentLevel = useGameStore(state => state.currentLevel);
  
  if (!boss) return null;
  
  const healthPercent = (boss.health / boss.maxHealth) * 100;
  const bossNames = {
    demogorgon: 'DEMOGORGON',
    mindflayer: 'MIND FLAYER',
    vecna: 'VECNA'
  };

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-[500px] z-40">
      <div className="text-center mb-2">
        <span className="stranger-title text-2xl text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
          {bossNames[boss.type]}
        </span>
      </div>
      <div className="h-6 bg-black/70 border-2 border-red-900 rounded-sm overflow-hidden">
        <div 
          className="h-full transition-all duration-300 bg-gradient-to-r from-red-800 via-red-600 to-red-500"
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      <div className="text-center mt-1 text-red-300 font-mono text-sm">
        {boss.health} / {boss.maxHealth}
      </div>
    </div>
  );
}

// Level intro overlay
function LevelIntro() {
  const showLevelIntro = useGameStore(state => state.showLevelIntro);
  const currentLevel = useGameStore(state => state.currentLevel);
  const dismissLevelIntro = useGameStore(state => state.dismissLevelIntro);
  
  if (!showLevelIntro) return null;
  
  const config = LEVEL_CONFIG[currentLevel];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 pointer-events-auto z-50">
      <div className="text-center space-y-8 animate-pulse">
        <div className="text-red-600 font-mono text-xl tracking-widest">LEVEL {currentLevel}</div>
        <h1 className="stranger-title text-6xl md:text-8xl text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]">
          {config.name}
        </h1>
        <p className="text-red-300 text-2xl font-mono tracking-wider">
          {config.subtitle}
        </p>
        <Button 
          onClick={dismissLevelIntro}
          className="mt-8 px-12 py-6 text-xl bg-red-900 hover:bg-red-800 border-2 border-red-600 
                     shadow-[0_0_30px_rgba(255,0,0,0.5)] hover:shadow-[0_0_50px_rgba(255,0,0,0.7)] 
                     transition-all duration-300"
        >
          <Zap className="mr-2" /> ENTER THE UPSIDE DOWN
        </Button>
      </div>
    </div>
  );
}

function UI() {
  const { score, health, isGameOver, isVictory, isPlaying, startGame, resetGame, currentLevel } = useGameStore();
  const { mutate: submitScore, isPending } = useSubmitScore();
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const { data: scores } = useScores();

  const handleStart = () => {
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
        <div className="space-y-2">
          <div className="hud-text text-4xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            SCORE: {score.toString().padStart(6, '0')}
          </div>
          <div className="hud-text text-lg text-red-300">
            LEVEL {currentLevel}: {LEVEL_CONFIG[currentLevel].name}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="hud-text text-2xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            HEALTH: {health}%
          </div>
          <div className="w-48 h-4 bg-black/50 border border-red-900">
            <div 
              className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-300" 
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
      </div>

      {/* Crosshair - Stranger Things style */}
      <div className="crosshair-st" />
      <div className="vignette-st" />
      <div className="noise-overlay" />

      {/* Boss health bar */}
      <BossHealthBar />

      {/* Level intro */}
      <LevelIntro />

      {/* Start/Game Over/Victory Overlay */}
      {(!isPlaying || isGameOver || isVictory) && !useGameStore.getState().showLevelIntro && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 pointer-events-auto backdrop-blur-sm z-50">
          <div className="bg-zinc-950/95 border-2 border-red-900/50 p-8 rounded-lg max-w-2xl w-full shadow-[0_0_100px_rgba(255,0,0,0.2)]">
            <h1 className="stranger-title text-5xl md:text-7xl text-center mb-8 text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
              {isVictory ? "VICTORY" : isGameOver ? "GAME OVER" : "STRANGER THINGS"}
            </h1>
            
            {isVictory && (
              <p className="text-center text-red-300 text-xl mb-6 font-mono">
                You defeated Vecna and saved Hawkins!
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Controls / Submission */}
              <div className="space-y-6">
                {(isGameOver || isVictory) ? (
                  <div className="space-y-4">
                    <p className="text-2xl text-center text-red-400 font-mono">FINAL SCORE: {score}</p>
                    <div className="space-y-2">
                      <Input 
                        placeholder="ENTER YOUR NAME" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="bg-black/50 border-red-900 font-mono text-red-400 uppercase tracking-widest placeholder:text-red-900"
                        maxLength={10}
                      />
                      <Button 
                        onClick={handleSubmit} 
                        disabled={isPending}
                        className="w-full bg-red-900 hover:bg-red-800 text-white font-bold tracking-widest border border-red-700"
                      >
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : "SAVE SCORE"}
                      </Button>
                      <Button 
                        onClick={resetGame} 
                        variant="outline"
                        className="w-full border-red-900 text-red-400 hover:bg-red-900/20"
                      >
                        <Skull className="mr-2 h-4 w-4" /> TRY AGAIN
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="text-red-300/70 font-mono text-sm space-y-2 border border-red-900/30 p-4 bg-black/30 rounded">
                      <p className="text-red-400 font-bold mb-3">CONTROLS</p>
                      <p>WASD - Move</p>
                      <p>SPACE - Jump</p>
                      <p>MOUSE - Look & Shoot</p>
                      <p className="mt-4 text-red-500">Defeat all three bosses to save Hawkins!</p>
                    </div>
                    <Button 
                      onClick={handleStart}
                      className="w-full py-8 text-2xl bg-red-900 hover:bg-red-800 hover:scale-105 
                                 transition-all border-2 border-red-600 
                                 shadow-[0_0_30px_rgba(255,0,0,0.4)] hover:shadow-[0_0_50px_rgba(255,0,0,0.6)]"
                    >
                      <Zap className="mr-2" /> ENTER THE UPSIDE DOWN
                    </Button>
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="border-l border-red-900/30 pl-8">
                <div className="flex items-center gap-2 mb-4 text-amber-500">
                  <Trophy className="w-5 h-5" />
                  <h3 className="text-lg font-bold tracking-wider">HALL OF HEROES</h3>
                </div>
                
                <div className="space-y-2 font-mono text-sm max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {scores?.sort((a,b) => b.score - a.score).slice(0, 10).map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-red-950/30 rounded border border-red-900/20 hover:border-red-600/50 transition-colors">
                      <span className="text-red-400">#{i + 1} {s.username}</span>
                      <span className="text-white font-bold">{s.score}</span>
                    </div>
                  ))}
                  {(!scores || scores.length === 0) && (
                    <div className="text-red-900 text-center py-8">No survivors yet...</div>
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
          {/* Dark, ominous sky - no stars, just darkness */}
          <color attach="background" args={['#050000']} />
          
          <Physics gravity={[0, -9.8, 0]}>
            <Player />
            <Weapon />
            <EnemyManager />
            <BossManager />
            <Level />
          </Physics>
          <PointerLockControls />
        </Suspense>
      </Canvas>
      <UI />
    </div>
  );
}
