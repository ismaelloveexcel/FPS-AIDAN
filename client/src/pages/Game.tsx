import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { PointerLockControls } from '@react-three/drei';
import { Suspense, useEffect, useRef } from 'react';
import { useGameStore, LEVEL_CONFIG } from '@/game/store';
import { Player } from '@/game/Player';
import { Weapon } from '@/game/Weapon';
import { Level } from '@/game/Level';
import { EnemyManager } from '@/game/Enemy';
import { BossManager } from '@/game/Boss';
import { Button } from '@/components/ui/button';
import { useSubmitScore, useScores } from '@/hooks/use-scores';
import { Loader2, Trophy, Skull, Zap, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Dedication screen shown before the game starts
function DedicationScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Try to play the dedication song
    audioRef.current = new Audio('/turn-around.mp3');
    audioRef.current.volume = 0.5;
    audioRef.current.play().catch(() => {
      // Audio autoplay blocked - that's ok, continue without it
      console.log('Audio autoplay blocked by browser');
    });

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
        // Fade out audio
        if (audioRef.current) {
          fadeIntervalRef.current = setInterval(() => {
            if (audioRef.current && audioRef.current.volume > 0.1) {
              audioRef.current.volume -= 0.1;
            } else {
              if (audioRef.current) {
                audioRef.current.pause();
              }
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
              }
            }
          }, 200);
        }
      }, 1500);
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-1500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleSkip}
    >
      <div className="text-center space-y-8 animate-pulse">
        <Heart className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
        <div className="space-y-4">
          <p className="text-red-400 font-mono text-xl tracking-widest">This game is</p>
          <h1 className="stranger-title text-5xl md:text-7xl text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]">
            Dedicated to
          </h1>
          <h2 className="stranger-title text-6xl md:text-8xl text-red-400 drop-shadow-[0_0_40px_rgba(255,100,100,0.9)] mt-4">
            Awesome Aidan
          </h2>
        </div>
        <p className="text-red-600/50 font-mono text-sm mt-12">Click anywhere to continue</p>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-red-500/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

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
      <div className="text-center space-y-8">
        <div className="text-red-600 font-mono text-xl tracking-widest">LEVEL {currentLevel}</div>
        <h1 className="stranger-title text-6xl md:text-8xl text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)] animate-pulse">
          {config.name}
        </h1>
        <p className="text-red-300 text-2xl font-mono tracking-wider">
          {config.subtitle}
        </p>
        <p className="text-red-400/70 text-lg font-mono italic max-w-md mx-auto">
          "{config.storyText}"
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

// Level complete overlay with stats
function LevelComplete() {
  const showLevelComplete = useGameStore(state => state.showLevelComplete);
  const currentLevel = useGameStore(state => state.currentLevel);
  const dismissLevelComplete = useGameStore(state => state.dismissLevelComplete);
  const enemiesKilled = useGameStore(state => state.enemiesKilled);
  const shotsFired = useGameStore(state => state.shotsFired);
  const shotsHit = useGameStore(state => state.shotsHit);
  const levelStartTime = useGameStore(state => state.levelStartTime);
  const score = useGameStore(state => state.score);
  
  if (!showLevelComplete) return null;
  
  // Calculate stats
  const accuracy = shotsFired > 0 ? Math.round((shotsHit / shotsFired) * 100) : 0;
  const timeTaken = Math.round((Date.now() - levelStartTime) / 1000);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  
  const prevLevelConfig = LEVEL_CONFIG[currentLevel as 1 | 2 | 3];
  const nextLevel = (currentLevel + 1) as 2 | 3;
  const nextLevelConfig = currentLevel < 3 ? LEVEL_CONFIG[nextLevel] : null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 pointer-events-auto z-50">
      <div className="text-center space-y-6 max-w-lg">
        <div className="text-green-500 font-mono text-2xl tracking-widest">LEVEL {currentLevel} COMPLETE</div>
        <h1 className="stranger-title text-5xl text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]">
          {prevLevelConfig.name}
        </h1>
        
        {/* Stats */}
        <div className="bg-black/50 border border-red-900/50 rounded-lg p-6 space-y-3">
          <div className="flex justify-between text-red-300 font-mono">
            <span>Enemies Killed:</span>
            <span className="text-white">{enemiesKilled}</span>
          </div>
          <div className="flex justify-between text-red-300 font-mono">
            <span>Accuracy:</span>
            <span className="text-white">{accuracy}%</span>
          </div>
          <div className="flex justify-between text-red-300 font-mono">
            <span>Time:</span>
            <span className="text-white">{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
          <div className="flex justify-between text-red-300 font-mono border-t border-red-900/30 pt-3">
            <span>Score:</span>
            <span className="text-yellow-400 font-bold">{score}</span>
          </div>
        </div>

        {/* Story transition */}
        <p className="text-red-400/70 text-lg font-mono italic">
          "{prevLevelConfig.victoryText}"
        </p>

        {nextLevelConfig && (
          <p className="text-purple-400 text-xl font-mono">
            Next: {nextLevelConfig.name}
          </p>
        )}

        <Button 
          onClick={dismissLevelComplete}
          className="mt-4 px-12 py-6 text-xl bg-green-900 hover:bg-green-800 border-2 border-green-600 
                     shadow-[0_0_30px_rgba(0,255,0,0.3)] hover:shadow-[0_0_50px_rgba(0,255,0,0.5)] 
                     transition-all duration-300"
        >
          <Zap className="mr-2" /> NEXT LEVEL
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

      {/* Level complete */}
      <LevelComplete />

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
  const [showDedication, setShowDedication] = useState(true);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Dedication Screen */}
      {showDedication && (
        <DedicationScreen onComplete={() => setShowDedication(false)} />
      )}
      
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
