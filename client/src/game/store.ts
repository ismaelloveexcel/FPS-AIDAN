import { create } from 'zustand';

interface GameState {
  score: number;
  health: number;
  isGameOver: boolean;
  isPlaying: boolean;
  enemies: Array<{ id: string; position: [number, number, number] }>;
  
  // Actions
  addScore: (points: number) => void;
  takeDamage: (amount: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  spawnEnemy: (id: string, position: [number, number, number]) => void;
  removeEnemy: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  health: 100,
  isGameOver: false,
  isPlaying: false,
  enemies: [],

  addScore: (points) => set((state) => ({ score: state.score + points })),
  takeDamage: (amount) => set((state) => {
    const newHealth = Math.max(0, state.health - amount);
    return { 
      health: newHealth,
      isGameOver: newHealth <= 0 
    };
  }),
  startGame: () => set({ isPlaying: true, isGameOver: false, score: 0, health: 100, enemies: [] }),
  endGame: () => set({ isPlaying: false, isGameOver: true }),
  resetGame: () => set({ isPlaying: false, isGameOver: false, score: 0, health: 100, enemies: [] }),
  
  spawnEnemy: (id, position) => set((state) => ({ 
    enemies: [...state.enemies, { id, position }] 
  })),
  removeEnemy: (id) => set((state) => ({ 
    enemies: state.enemies.filter(e => e.id !== id) 
  })),
}));
