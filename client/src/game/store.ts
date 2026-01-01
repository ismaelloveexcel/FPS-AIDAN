import { create } from 'zustand';

// Boss types for each level
export type BossType = 'demogorgon' | 'mindflayer' | 'vecna';
export type BossPhase = 1 | 2 | 3;
export type WeaponType = 'pistol' | 'nailbat' | 'flamethrower';
export type PowerUpType = 'eggo' | 'skateboard' | 'shield';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Boss {
  id: string;
  type: BossType;
  health: number;
  maxHealth: number;
  position: [number, number, number];
  phase: BossPhase;
  isInvulnerable: boolean;
  isTeleporting?: boolean;
  hasVines?: boolean;
  clockCurseActive?: boolean;
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: [number, number, number];
}

// Difficulty multipliers
export const DIFFICULTY_CONFIG = {
  easy: { damageMultiplier: 0.5, enemySpeedMultiplier: 0.7, bossHealthMultiplier: 0.6 },
  normal: { damageMultiplier: 1, enemySpeedMultiplier: 1, bossHealthMultiplier: 1 },
  hard: { damageMultiplier: 1.5, enemySpeedMultiplier: 1.3, bossHealthMultiplier: 1.5 },
};

// Weapon stats
export const WEAPON_STATS = {
  pistol: { damage: 50, range: 100, fireRate: 300, ammo: Infinity, name: 'Pistol' },
  nailbat: { damage: 150, range: 3, fireRate: 500, ammo: Infinity, name: "Steve's Nail Bat" },
  flamethrower: { damage: 30, range: 15, fireRate: 50, ammo: 100, name: 'Flamethrower' },
};

// Power-up effects
export const POWERUP_CONFIG = {
  eggo: { healthRestore: 30, duration: 0, name: "Eleven's Eggo" },
  skateboard: { speedBoost: 1.5, duration: 10000, name: "Max's Skateboard" },
  shield: { shieldAmount: 50, duration: 8000, name: "Eleven's Shield" },
};

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
    subtitle: 'Face the Demogorgon',
    storyText: 'November 1983. A rift between worlds has torn open beneath Hawkins Laboratory. From the darkness emerges a creature of pure nightmare—the Demogorgon. It feeds on fear. It hunts in shadows. And now... it hunts you.',
    victoryText: 'The Demogorgon collapses into ash, but the ground trembles. The gate grows wider. Something far worse is coming...',
    unlockedWeapon: 'pistol' as WeaponType,
    atmosphere: 'The air tastes like copper and decay.'
  },
  2: { 
    boss: 'mindflayer' as BossType, 
    bossHealth: 800, 
    name: 'THE SHADOW REALM',
    subtitle: 'Survive the Mind Flayer',
    storyText: 'The sky bleeds crimson as storm clouds swirl above Hawkins. The Mind Flayer—a cosmic entity of unfathomable evil—extends its shadow across the land. It does not merely kill. It possesses. It corrupts. It becomes you.',
    victoryText: 'Lightning cracks as the Mind Flayer\'s form dissolves into the storm. But in the silence that follows, you hear it—the chiming of a grandfather clock. Somewhere, Vecna waits.',
    unlockedWeapon: 'nailbat' as WeaponType,
    atmosphere: 'Reality bends at the edges of your vision.'
  },
  3: { 
    boss: 'vecna' as BossType, 
    bossHealth: 1500, 
    name: 'VECNA\'S LAIR',
    subtitle: 'End the Nightmare',
    storyText: 'The Creel House stands before you, warped and twisted by Vecna\'s influence. Henry Creel—One—Vecna. Three names for the same ancient evil. He has opened four gates. He seeks to merge worlds. Only you stand between Hawkins and total annihilation.',
    victoryText: 'Vecna\'s body crumbles as light floods the Upside Down. The gates seal. The nightmare ends. Hawkins is saved—but some doors, once opened, can never truly be closed...',
    unlockedWeapon: 'flamethrower' as WeaponType,
    atmosphere: 'Time itself seems to fracture around you.'
  },
};

interface GameState {
  score: number;
  health: number;
  shield: number;
  isGameOver: boolean;
  isVictory: boolean;
  isPlaying: boolean;
  currentLevel: 1 | 2 | 3;
  boss: Boss | null;
  enemies: Array<{ id: string; position: [number, number, number]; health: number }>;
  showLevelIntro: boolean;
  showLevelComplete: boolean;
  showVictoryCutscene: boolean;
  
  // Difficulty
  difficulty: Difficulty;
  
  // Weapons
  currentWeapon: WeaponType;
  unlockedWeapons: WeaponType[];
  flamethrowerAmmo: number;
  
  // Power-ups
  powerUps: PowerUp[];
  activeEffects: { type: PowerUpType; expiresAt: number }[];
  speedMultiplier: number;
  
  // Flashlight
  flashlightOn: boolean;
  flashlightBattery: number;
  
  // Stats tracking
  enemiesKilled: number;
  shotsFired: number;
  shotsHit: number;
  levelStartTime: number;
  totalPlayTime: number;
  
  // Actions
  setDifficulty: (difficulty: Difficulty) => void;
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
  
  // New actions
  switchWeapon: (weapon: WeaponType) => void;
  useFlamethrowerAmmo: (amount: number) => void;
  spawnPowerUp: (type: PowerUpType, position: [number, number, number]) => void;
  collectPowerUp: (id: string) => void;
  toggleFlashlight: () => void;
  drainFlashlightBattery: (amount: number) => void;
  updateActiveEffects: () => void;
  dismissVictoryCutscene: () => void;
  setBossPhase: (phase: BossPhase) => void;
  setBossTeleporting: (isTeleporting: boolean) => void;
  activateClockCurse: () => void;
  spawnVines: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  health: 100,
  shield: 0,
  isGameOver: false,
  isVictory: false,
  isPlaying: false,
  currentLevel: 1,
  boss: null,
  enemies: [],
  showLevelIntro: false,
  showLevelComplete: false,
  showVictoryCutscene: false,
  
  // Difficulty
  difficulty: 'normal',
  
  // Weapons
  currentWeapon: 'pistol',
  unlockedWeapons: ['pistol'],
  flamethrowerAmmo: 100,
  
  // Power-ups
  powerUps: [],
  activeEffects: [],
  speedMultiplier: 1,
  
  // Flashlight
  flashlightOn: false,
  flashlightBattery: 100,
  
  // Stats
  enemiesKilled: 0,
  shotsFired: 0,
  shotsHit: 0,
  levelStartTime: 0,
  totalPlayTime: 0,

  setDifficulty: (difficulty) => set({ difficulty }),

  addScore: (points) => set((state) => ({ score: state.score + points })),
  
  takeDamage: (amount) => set((state) => {
    const diffConfig = DIFFICULTY_CONFIG[state.difficulty];
    const actualDamage = Math.round(amount * diffConfig.damageMultiplier);
    
    // Shield absorbs damage first
    let remainingDamage = actualDamage;
    let newShield = state.shield;
    
    if (state.shield > 0) {
      if (state.shield >= remainingDamage) {
        newShield = state.shield - remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= state.shield;
        newShield = 0;
      }
    }
    
    const newHealth = Math.max(0, state.health - remainingDamage);
    return { 
      health: newHealth,
      shield: newShield,
      isGameOver: newHealth <= 0 
    };
  }),
  
  startGame: () => {
    const { difficulty } = get();
    set({ 
      isPlaying: true, 
      isGameOver: false, 
      isVictory: false,
      score: 0, 
      health: 100,
      shield: 0,
      enemies: [],
      currentLevel: 1,
      boss: null,
      showLevelIntro: true,
      showLevelComplete: false,
      showVictoryCutscene: false,
      enemiesKilled: 0,
      shotsFired: 0,
      shotsHit: 0,
      levelStartTime: Date.now(),
      totalPlayTime: 0,
      currentWeapon: 'pistol',
      unlockedWeapons: ['pistol'],
      flamethrowerAmmo: 100,
      powerUps: [],
      activeEffects: [],
      speedMultiplier: 1,
      flashlightOn: false,
      flashlightBattery: 100
    });
  },
  
  endGame: () => set({ isPlaying: false, isGameOver: true }),
  
  resetGame: () => set({ 
    isPlaying: false, 
    isGameOver: false, 
    isVictory: false,
    score: 0, 
    health: 100,
    shield: 0,
    enemies: [],
    currentLevel: 1,
    boss: null,
    showLevelIntro: false,
    showLevelComplete: false,
    showVictoryCutscene: false,
    enemiesKilled: 0,
    shotsFired: 0,
    shotsHit: 0,
    levelStartTime: 0,
    totalPlayTime: 0,
    currentWeapon: 'pistol',
    unlockedWeapons: ['pistol'],
    flamethrowerAmmo: 100,
    powerUps: [],
    activeEffects: [],
    speedMultiplier: 1,
    flashlightOn: false,
    flashlightBattery: 100
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
    const { currentLevel, difficulty } = get();
    const config = LEVEL_CONFIG[currentLevel];
    const diffConfig = DIFFICULTY_CONFIG[difficulty];
    const bossHealth = Math.round(config.bossHealth * diffConfig.bossHealthMultiplier);
    
    set({
      boss: {
        id: `boss-${currentLevel}`,
        type: config.boss,
        health: bossHealth,
        maxHealth: bossHealth,
        position: [0, 3, -15],
        phase: 1,
        isInvulnerable: false,
        isTeleporting: false,
        hasVines: false,
        clockCurseActive: false
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
      // Boss defeated
      const newScore = state.score + (state.currentLevel * 1000);
      const newUnlockedWeapons = [...state.unlockedWeapons];
      
      // Unlock new weapon for next level
      if (state.currentLevel === 1 && !newUnlockedWeapons.includes('nailbat')) {
        newUnlockedWeapons.push('nailbat');
      } else if (state.currentLevel === 2 && !newUnlockedWeapons.includes('flamethrower')) {
        newUnlockedWeapons.push('flamethrower');
      }
      
      if (state.currentLevel === 3) {
        // Game complete! Show victory cutscene
        return {
          boss: null,
          score: newScore,
          unlockedWeapons: newUnlockedWeapons,
          showVictoryCutscene: true
        };
      } else {
        // Show level complete before advancing
        return {
          boss: null,
          score: newScore,
          unlockedWeapons: newUnlockedWeapons,
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
        levelStartTime: Date.now(),
        powerUps: [],
        activeEffects: [],
        speedMultiplier: 1
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
  })),

  // New weapon actions
  switchWeapon: (weapon) => set((state) => {
    if (state.unlockedWeapons.includes(weapon)) {
      return { currentWeapon: weapon };
    }
    return state;
  }),

  useFlamethrowerAmmo: (amount) => set((state) => ({
    flamethrowerAmmo: Math.max(0, state.flamethrowerAmmo - amount)
  })),

  // Power-up actions
  spawnPowerUp: (type, position) => set((state) => ({
    powerUps: [...state.powerUps, { id: `powerup-${Date.now()}`, type, position }]
  })),

  collectPowerUp: (id) => set((state) => {
    const powerUp = state.powerUps.find(p => p.id === id);
    if (!powerUp) return state;

    let updates: Partial<GameState> = {
      powerUps: state.powerUps.filter(p => p.id !== id)
    };

    switch (powerUp.type) {
      case 'eggo':
        updates.health = Math.min(100, state.health + POWERUP_CONFIG.eggo.healthRestore);
        break;
      case 'skateboard':
        updates.speedMultiplier = POWERUP_CONFIG.skateboard.speedBoost;
        updates.activeEffects = [...state.activeEffects, { 
          type: 'skateboard', 
          expiresAt: Date.now() + POWERUP_CONFIG.skateboard.duration 
        }];
        break;
      case 'shield':
        updates.shield = Math.min(100, state.shield + POWERUP_CONFIG.shield.shieldAmount);
        updates.activeEffects = [...state.activeEffects, { 
          type: 'shield', 
          expiresAt: Date.now() + POWERUP_CONFIG.shield.duration 
        }];
        break;
    }

    return updates as GameState;
  }),

  // Flashlight
  toggleFlashlight: () => set((state) => ({ 
    flashlightOn: state.flashlightBattery > 0 ? !state.flashlightOn : false 
  })),

  drainFlashlightBattery: (amount) => set((state) => {
    const newBattery = Math.max(0, state.flashlightBattery - amount);
    return { 
      flashlightBattery: newBattery,
      flashlightOn: newBattery > 0 ? state.flashlightOn : false
    };
  }),

  // Update active effects (call on each frame)
  updateActiveEffects: () => set((state) => {
    const now = Date.now();
    const activeEffects = state.activeEffects.filter(e => e.expiresAt > now);
    
    // Reset speed if skateboard expired
    const hasSpeedBoost = activeEffects.some(e => e.type === 'skateboard');
    
    return {
      activeEffects,
      speedMultiplier: hasSpeedBoost ? POWERUP_CONFIG.skateboard.speedBoost : 1
    };
  }),

  // Victory cutscene
  dismissVictoryCutscene: () => set({ 
    showVictoryCutscene: false, 
    isVictory: true, 
    isPlaying: false 
  }),

  // Vecna boss mechanics
  setBossPhase: (phase) => set((state) => {
    if (!state.boss) return state;
    return { boss: { ...state.boss, phase } };
  }),

  setBossTeleporting: (isTeleporting) => set((state) => {
    if (!state.boss) return state;
    return { boss: { ...state.boss, isTeleporting, isInvulnerable: isTeleporting } };
  }),

  activateClockCurse: () => set((state) => {
    if (!state.boss || state.boss.type !== 'vecna') return state;
    return { boss: { ...state.boss, clockCurseActive: true } };
  }),

  spawnVines: () => set((state) => {
    if (!state.boss || state.boss.type !== 'vecna') return state;
    return { boss: { ...state.boss, hasVines: true } };
  })
}));
