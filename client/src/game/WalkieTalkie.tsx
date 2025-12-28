import { useEffect, useState, useRef } from 'react';
import { useGameStore } from './store';
import { Radio } from 'lucide-react';

interface Hint {
  id: string;
  character: 'Dustin' | 'Steve' | 'Nancy' | 'Eleven';
  message: string;
  duration: number;
}

// Context-aware hints based on game state
const HINTS = {
  gameStart: [
    { character: 'Dustin' as const, message: 'Testing, testing... Can you hear me? Welcome to the Upside Down!', duration: 4000 },
    { character: 'Steve' as const, message: "Alright, let's do this. Stay sharp out there.", duration: 3000 },
  ],
  level1Start: [
    { character: 'Dustin' as const, message: "That's the Demogorgon! Aim for the head and keep moving!", duration: 4000 },
    { character: 'Nancy' as const, message: "Don't let it get close. These things are faster than they look.", duration: 4000 },
  ],
  level1BossLowHealth: [
    { character: 'Steve' as const, message: "It's weakening! Keep up the pressure!", duration: 3000 },
    { character: 'Dustin' as const, message: 'Almost there! Just a little more!', duration: 2500 },
  ],
  level2Start: [
    { character: 'Dustin' as const, message: 'The Mind Flayer... This is bad. Really bad.', duration: 3500 },
    { character: 'Eleven' as const, message: 'Stay strong. We can beat it together.', duration: 3000 },
  ],
  level2WeaponUnlock: [
    { character: 'Steve' as const, message: "Take this nail bat! It's saved my life more times than I can count.", duration: 4000 },
  ],
  level3Start: [
    { character: 'Nancy' as const, message: "Vecna... If we don't stop him now, everyone in Hawkins is doomed.", duration: 4500 },
    { character: 'Dustin' as const, message: "Remember, he plays mind tricks. Don't let him get in your head!", duration: 4000 },
  ],
  level3WeaponUnlock: [
    { character: 'Steve' as const, message: "Flamethrower! Now we're talking. Light him up!", duration: 3500 },
  ],
  lowHealth: [
    { character: 'Dustin' as const, message: "Your health is critical! Find an Eggo waffle, quick!", duration: 3500 },
    { character: 'Nancy' as const, message: "You're hurt bad. Take cover and look for health!", duration: 3500 },
  ],
  powerUpNearby: [
    { character: 'Dustin' as const, message: 'I see a power-up on your radar. Go grab it!', duration: 3000 },
  ],
  victory: [
    { character: 'Dustin' as const, message: 'You did it! Hawkins is safe!', duration: 3000 },
    { character: 'Steve' as const, message: "That's what I'm talking about! Great job!", duration: 3000 },
    { character: 'Eleven' as const, message: 'Thank you... for everything.', duration: 3000 },
  ],
};

export function WalkieTalkieHints() {
  const [currentHint, setCurrentHint] = useState<Hint | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastHintTime = useRef<number>(0);
  const shownHints = useRef<Set<string>>(new Set());

  const isPlaying = useGameStore(state => state.isPlaying);
  const currentLevel = useGameStore(state => state.currentLevel);
  const health = useGameStore(state => state.health);
  const boss = useGameStore(state => state.boss);
  const powerUps = useGameStore(state => state.powerUps);
  const unlockedWeapons = useGameStore(state => state.unlockedWeapons);
  const showLevelIntro = useGameStore(state => state.showLevelIntro);
  const showVictoryCutscene = useGameStore(state => state.showVictoryCutscene);
  const isVictory = useGameStore(state => state.isVictory);

  const showHint = (hints: typeof HINTS[keyof typeof HINTS], key: string) => {
    const now = Date.now();
    // Prevent spam - at least 8 seconds between hints
    if (now - lastHintTime.current < 8000) return;
    
    // Don't show the same hint twice
    if (shownHints.current.has(key)) return;

    const hint = hints[Math.floor(Math.random() * hints.length)];
    const hintWithId = {
      ...hint,
      id: key + '-' + now,
    };

    setCurrentHint(hintWithId);
    setIsVisible(true);
    lastHintTime.current = now;
    shownHints.current.add(key);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setCurrentHint(null), 500);
    }, hint.duration);
  };

  // Game start hint
  useEffect(() => {
    if (isPlaying && currentLevel === 1 && !showLevelIntro) {
      setTimeout(() => showHint(HINTS.gameStart, 'gameStart'), 1000);
    }
  }, [isPlaying, currentLevel, showLevelIntro]);

  // Level start hints
  useEffect(() => {
    if (isPlaying && !showLevelIntro && boss) {
      if (currentLevel === 1) {
        setTimeout(() => showHint(HINTS.level1Start, 'level1Start'), 2000);
      } else if (currentLevel === 2) {
        setTimeout(() => showHint(HINTS.level2Start, 'level2Start'), 2000);
      } else if (currentLevel === 3) {
        setTimeout(() => showHint(HINTS.level3Start, 'level3Start'), 2000);
      }
    }
  }, [isPlaying, showLevelIntro, boss, currentLevel]);

  // Boss low health hints
  useEffect(() => {
    if (boss && boss.health < boss.maxHealth * 0.3) {
      if (currentLevel === 1) {
        showHint(HINTS.level1BossLowHealth, 'level1BossLow');
      }
    }
  }, [boss, currentLevel]);

  // Weapon unlock hints
  useEffect(() => {
    if (currentLevel === 2 && unlockedWeapons.includes('nailbat')) {
      setTimeout(() => showHint(HINTS.level2WeaponUnlock, 'level2Weapon'), 1000);
    }
    if (currentLevel === 3 && unlockedWeapons.includes('flamethrower')) {
      setTimeout(() => showHint(HINTS.level3WeaponUnlock, 'level3Weapon'), 1000);
    }
  }, [currentLevel, unlockedWeapons]);

  // Low health warning
  useEffect(() => {
    if (isPlaying && health < 30 && health > 0) {
      showHint(HINTS.lowHealth, 'lowHealth');
    }
  }, [isPlaying, health]);

  // Power-up nearby
  useEffect(() => {
    if (isPlaying && powerUps.length > 0) {
      const now = Date.now();
      if (now - lastHintTime.current > 15000) {
        showHint(HINTS.powerUpNearby, 'powerUpNearby');
      }
    }
  }, [isPlaying, powerUps.length]);

  // Victory hint
  useEffect(() => {
    if (showVictoryCutscene || isVictory) {
      setTimeout(() => showHint(HINTS.victory, 'victory'), 2000);
    }
  }, [showVictoryCutscene, isVictory]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset shown hints when game restarts
  useEffect(() => {
    if (!isPlaying) {
      shownHints.current.clear();
    }
  }, [isPlaying]);

  if (!currentHint) return null;

  const characterColors = {
    Dustin: 'from-blue-900 to-blue-700',
    Steve: 'from-red-900 to-red-700',
    Nancy: 'from-purple-900 to-purple-700',
    Eleven: 'from-pink-900 to-pink-700',
  };

  const characterTextColors = {
    Dustin: 'text-blue-300',
    Steve: 'text-red-300',
    Nancy: 'text-purple-300',
    Eleven: 'text-pink-300',
  };

  return (
    <div 
      className={`absolute top-32 left-6 z-40 max-w-md transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
      }`}
    >
      <div className={`bg-gradient-to-r ${characterColors[currentHint.character]} border-2 border-white/20 rounded-lg p-4 shadow-2xl backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <div className={`font-bold ${characterTextColors[currentHint.character]} text-sm mb-1 tracking-wide`}>
              {currentHint.character.toUpperCase()}
            </div>
            <div className="text-white text-sm font-mono leading-relaxed">
              {currentHint.message}
            </div>
          </div>
        </div>
        
        {/* Radio static effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_4px)]" />
        </div>
      </div>
      
      {/* Audio wave animation */}
      <div className="flex gap-1 mt-2 justify-center">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-green-500 rounded-full animate-pulse"
            style={{
              height: `${8 + Math.random() * 12}px`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '0.8s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
