// Audio Manager for game sound effects and background music
// Handles loading, playing, and managing all game audio

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private music: Map<string, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private soundVolume = 0.5;
  private musicVolume = 0.3;
  private isMuted = false;

  private constructor() {
    // Initialize audio context
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Preload a sound effect
  public loadSound(name: string, url: string): void {
    const audio = new Audio(url);
    audio.volume = this.soundVolume;
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  // Preload background music
  public loadMusic(name: string, url: string): void {
    const audio = new Audio(url);
    audio.volume = this.musicVolume;
    audio.loop = true;
    audio.preload = 'auto';
    this.music.set(name, audio);
  }

  // Play a sound effect
  public playSound(name: string, volume: number = 1.0): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(name);
    if (sound) {
      // Clone the audio to allow overlapping sounds
      const clone = sound.cloneNode(true);
      // Verify the clone is an HTMLAudioElement
      if (clone instanceof HTMLAudioElement) {
        clone.volume = this.soundVolume * volume;
        clone.play().catch(err => console.warn(`Failed to play sound ${name}:`, err));
      }
    }
  }

  // Play background music
  public playMusic(name: string, fadeIn: boolean = true): void {
    if (this.isMuted) return;

    const newMusic = this.music.get(name);
    if (!newMusic) return;

    // Stop current music with fade out
    if (this.currentMusic && this.currentMusic !== newMusic) {
      this.stopMusic(true);
    }

    this.currentMusic = newMusic;
    
    if (fadeIn) {
      newMusic.volume = 0;
      newMusic.play().catch(err => console.warn(`Failed to play music ${name}:`, err));
      this.fadeMusicIn(newMusic, this.musicVolume, 2000);
    } else {
      newMusic.volume = this.musicVolume;
      newMusic.play().catch(err => console.warn(`Failed to play music ${name}:`, err));
    }
  }

  // Stop current music
  public stopMusic(fadeOut: boolean = true): void {
    if (!this.currentMusic) return;

    if (fadeOut) {
      this.fadeMusicOut(this.currentMusic, 1000);
    } else {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  // Fade in music
  private fadeMusicIn(audio: HTMLAudioElement, targetVolume: number, duration: number): void {
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }

  // Fade out music
  private fadeMusicOut(audio: HTMLAudioElement, duration: number): void {
    const steps = 20;
    const stepDuration = duration / steps;
    const startVolume = audio.volume;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.currentTime = 0;
      }
    }, stepDuration);
  }

  // Set sound effects volume
  public setSoundVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = this.soundVolume;
    });
  }

  // Set music volume
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.music.forEach(music => {
      music.volume = this.musicVolume;
    });
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }
  }

  // Mute/unmute all audio
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.currentMusic) {
        this.currentMusic.pause();
      }
    } else {
      if (this.currentMusic) {
        this.currentMusic.play().catch(err => console.warn('Failed to resume music:', err));
      }
    }
  }

  // Get mute state
  public getMuted(): boolean {
    return this.isMuted;
  }

  // Initialize all game audio
  public initializeGameAudio(): void {
    // Weapon sounds
    this.loadSound('pistol-shot', '/sounds/pistol-shot.mp3');
    this.loadSound('bat-swing', '/sounds/bat-swing.mp3');
    this.loadSound('flamethrower', '/sounds/flamethrower.mp3');
    
    // Enemy sounds
    this.loadSound('enemy-growl', '/sounds/enemy-growl.mp3');
    this.loadSound('enemy-death', '/sounds/enemy-death.mp3');
    this.loadSound('boss-roar', '/sounds/boss-roar.mp3');
    
    // Power-up sounds
    this.loadSound('powerup-collect', '/sounds/powerup-collect.mp3');
    this.loadSound('health-restore', '/sounds/health-restore.mp3');
    
    // UI sounds
    this.loadSound('damage-taken', '/sounds/damage-taken.mp3');
    this.loadSound('level-complete', '/sounds/level-complete.mp3');
    
    // Background music
    this.loadMusic('level1-music', '/music/upside-down-theme.mp3');
    this.loadMusic('level2-music', '/music/mind-flayer-theme.mp3');
    this.loadMusic('level3-music', '/music/vecna-theme.mp3');
    this.loadMusic('menu-music', '/music/stranger-things-theme.mp3');
    this.loadMusic('victory-music', '/music/victory-theme.mp3');
  }

  // Clean up audio resources
  public cleanup(): void {
    this.stopMusic(false);
    this.sounds.clear();
    this.music.clear();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
