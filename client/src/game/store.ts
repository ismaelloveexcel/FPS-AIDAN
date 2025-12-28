import { create } from 'zustand';

// Boss types for each level
export type BossType = 'demogorgon' | 'mindflayer' | 'vecna';

export interface Boss {
  id: string;
  type: BossType;
  health: number;
  maxHealth: number;
  position: [number, number, number];
}

// Level configuration
export const LEVEL_CONFIG = {
  1: { 
    boss: 'demogorgon' as BossType, 
    bossHealth: 500, 
    name: 'THE UPSIDE DOWN',
    subtitle: 'Defeat the Demogorgon'
  },
  2: { 
    boss: 'mindflayer' as BossType, 
    bossHealth: 800, 
    name: 'THE SHADOW REALM',
    subtitle: 'Destroy the Mind Flayer'
  },
  3: { 
    boss: 'vecna' as BossType, 
    bossHealth: 1200, 
    name: 'VECNA\'S LAIR',
    subtitle: 'End Vecna\'s Terror'
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
  enemies: Array<{ id: string; position: [number, number, number] }>;
  showLevelIntro: boolean;
  
  // Actions
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  spawnEnemy: (id: string, position: [number, number, number]) => void;
  removeEnemy: (id: string) => void;
  damageBoss: (amount: number) => void;
  spawnBoss: () => void;
  nextLevel: () => void;
  dismissLevelIntro: () => void;
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
      showLevelIntro: true
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
    showLevelIntro: false
  }),
  
  spawnEnemy: (id, position) => set((state) => ({ 
    enemies: [...state.enemies, { id, position }] 
  })),
  removeEnemy: (id) => set((state) => ({ 
    enemies: state.enemies.filter(e => e.id !== id) 
  })),

  spawnBoss: () => {
    const { currentLevel } = get();
    const config = LEVEL_CONFIG[currentLevel];
    set({
      boss: {
        id: `boss-${currentLevel}`,
        type: config.boss,
        health: config.bossHealth,
        maxHealth: config.bossHealth,
        position: [0, 3, -15]
      }
    });
  },

  damageBoss: (amount) => set((state) => {
    if (!state.boss) return state;
    
    const newHealth = Math.max(0, state.boss.health - amount);
    
    if (newHealth <= 0) {
      // Boss defeated
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
        // Advance to next level
        return {
          boss: null,
          score: newScore,
          currentLevel: (state.currentLevel + 1) as 1 | 2 | 3,
          showLevelIntro: true,
          enemies: []
        };
      }
    }
    
    return {
      boss: { ...state.boss, health: newHealth }
    };
  }),

  nextLevel: () => {
    const { currentLevel } = get();
    if (currentLevel < 3) {
      set((state) => ({
        currentLevel: (state.currentLevel + 1) as 1 | 2 | 3,
        boss: null,
        enemies: [],
        showLevelIntro: true
      }));
    }
  },

  dismissLevelIntro: () => {
    set({ showLevelIntro: false });
    get().spawnBoss();
  }
}));
