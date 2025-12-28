import { create } from 'zustand';

// Boss types for each level
export type BossType = 'demogorgon' | 'mindflayer' | 'vecna';
export type BossPhase = 1 | 2 | 3;

export interface Boss {
  id: string;
  type: BossType;
  health: number;
  maxHealth: number;
  position: [number, number, number];
  phase: BossPhase;
  isInvulnerable: boolean;
}

// Enemy stats per level (from your proposal)
export const ENEMY_STATS = {
  1: { health: 1, speed: 3, damage: 10, points: 100, shotsToKill: 1 },
  2: { health: 2, speed: 4, damage: 15, points: 250, shotsToKill: 2 },
  3: { health: 3, speed: 5, damage: 25, points: 500, shotsToKill: 3 },
};

// Level configuration
export const LEVEL_CONFIG = {
  1: { 
    boss: 'demogorgon' as BossType, 
    bossHealth: 500, 
    name: 'THE UPSIDE DOWN',
    subtitle: 'Defeat the Demogorgon',
    storyText: 'The gate has opened. The Demogorgon hunts...',
    victoryText: 'The Demogorgon falls, but the gate widens...'
  },
  2: { 
    boss: 'mindflayer' as BossType, 
    bossHealth: 800, 
    name: 'THE SHADOW REALM',
    subtitle: 'Destroy the Mind Flayer',
    storyText: 'Storm clouds gather. The Mind Flayer approaches...',
    victoryText: 'The shadow recedes, but a darker evil awaits...'
  },
  3: { 
    boss: 'vecna' as BossType, 
    bossHealth: 1500, 
    name: 'VECNA\'S LAIR',
    subtitle: 'End Vecna\'s Terror',
    storyText: 'The clock chimes. Vecna\'s curse begins...',
    victoryText: 'Vecna is defeated! Hawkins is saved!'
  },
};

interface GameState {
  score: number;
  health: number;
  isGameOver: boolean;
  isVictory: boolean;
  isPlaying: boolean;
  currentLevel: 1 | 2 | 3;
  boss: Boss | null;
  enemies: Array<{ id: string; position: [number, number, number]; health: number }>;
  showLevelIntro: boolean;
  showLevelComplete: boolean;
  
  // Stats tracking
  enemiesKilled: number;
  shotsFired: number;
  shotsHit: number;
  levelStartTime: number;
  
  // Actions
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  spawnEnemy: (id: string, position: [number, number, number]) => void;
  removeEnemy: (id: string) => void;
  damageEnemy: (id: string, amount: number) => void;
  damageBoss: (amount: number) => void;
  spawnBoss: () => void;
  nextLevel: () => void;
  dismissLevelIntro: () => void;
  dismissLevelComplete: () => void;
  recordShot: (hit: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  health: 100,
  isGameOver: false,
  isVictory: false,
  isPlaying: false,
  currentLevel: 1,
  boss: null,
  enemies: [],
  showLevelIntro: false,
  showLevelComplete: false,
  
  // Stats
  enemiesKilled: 0,
  shotsFired: 0,
  shotsHit: 0,
  levelStartTime: 0,

  addScore: (points) => set((state) => ({ score: state.score + points })),
  takeDamage: (amount) => set((state) => {
    const newHealth = Math.max(0, state.health - amount);
    return { 
      health: newHealth,
      isGameOver: newHealth <= 0 
    };
  }),
  startGame: () => {
    set({ 
      isPlaying: true, 
      isGameOver: false, 
      isVictory: false,
      score: 0, 
      health: 100, 
      enemies: [],
      currentLevel: 1,
      boss: null,
      showLevelIntro: true,
      showLevelComplete: false,
      enemiesKilled: 0,
      shotsFired: 0,
      shotsHit: 0,
      levelStartTime: Date.now()
    });
  },
  endGame: () => set({ isPlaying: false, isGameOver: true }),
  resetGame: () => set({ 
    isPlaying: false, 
    isGameOver: false, 
    isVictory: false,
    score: 0, 
    health: 100, 
    enemies: [],
    currentLevel: 1,
    boss: null,
    showLevelIntro: false,
    showLevelComplete: false,
    enemiesKilled: 0,
    shotsFired: 0,
    shotsHit: 0,
    levelStartTime: 0
  }),
  
  spawnEnemy: (id, position) => set((state) => {
    const enemyHealth = ENEMY_STATS[state.currentLevel].health;
    return { 
      enemies: [...state.enemies, { id, position, health: enemyHealth }] 
    };
  }),
  
  removeEnemy: (id) => set((state) => ({ 
    enemies: state.enemies.filter(e => e.id !== id),
    enemiesKilled: state.enemiesKilled + 1
  })),

  damageEnemy: (id, amount) => set((state) => {
    const enemy = state.enemies.find(e => e.id === id);
    if (!enemy) return state;
    
    const newHealth = enemy.health - amount;
    if (newHealth <= 0) {
      // Enemy killed
      const points = ENEMY_STATS[state.currentLevel].points;
      return {
        enemies: state.enemies.filter(e => e.id !== id),
        enemiesKilled: state.enemiesKilled + 1,
        score: state.score + points
      };
    }
    
    return {
      enemies: state.enemies.map(e => 
        e.id === id ? { ...e, health: newHealth } : e
      )
    };
  }),

  spawnBoss: () => {
    const { currentLevel } = get();
    const config = LEVEL_CONFIG[currentLevel];
    set({
      boss: {
        id: `boss-${currentLevel}`,
        type: config.boss,
        health: config.bossHealth,
        maxHealth: config.bossHealth,
        position: [0, 3, -15],
        phase: 1,
        isInvulnerable: false
      },
      levelStartTime: Date.now()
    });
  },

  damageBoss: (amount) => set((state) => {
    if (!state.boss || state.boss.isInvulnerable) return state;
    
    const newHealth = Math.max(0, state.boss.health - amount);
    
    // Calculate boss phase based on health percentage
    const healthPercent = newHealth / state.boss.maxHealth;
    let newPhase: BossPhase = 1;
    if (healthPercent <= 0.33) newPhase = 3;
    else if (healthPercent <= 0.66) newPhase = 2;
    
    if (newHealth <= 0) {
      // Boss defeated - show level complete screen
      const newScore = state.score + (state.currentLevel * 1000);
      
      if (state.currentLevel === 3) {
        // Game complete!
        return {
          boss: null,
          score: newScore,
          isVictory: true,
          isPlaying: false
        };
      } else {
        // Show level complete before advancing
        return {
          boss: null,
          score: newScore,
          showLevelComplete: true
        };
      }
    }
    
    return {
      boss: { ...state.boss, health: newHealth, phase: newPhase }
    };
  }),

  nextLevel: () => {
    const { currentLevel } = get();
    if (currentLevel < 3) {
      set((state) => ({
        currentLevel: (state.currentLevel + 1) as 1 | 2 | 3,
        boss: null,
        enemies: [],
        showLevelIntro: true,
        showLevelComplete: false,
        health: Math.min(100, state.health + 25), // Restore some health
        levelStartTime: Date.now()
      }));
    }
  },

  dismissLevelIntro: () => {
    set({ showLevelIntro: false, levelStartTime: Date.now() });
    get().spawnBoss();
  },

  dismissLevelComplete: () => {
    get().nextLevel();
  },

  recordShot: (hit) => set((state) => ({
    shotsFired: state.shotsFired + 1,
    shotsHit: hit ? state.shotsHit + 1 : state.shotsHit
  }))
}));
