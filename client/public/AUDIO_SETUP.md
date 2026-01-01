# Audio Setup Guide

This game uses audio files for sound effects and background music to enhance the Stranger Things experience.

## Required Audio Files

Place the following audio files in the appropriate directories:

### Sound Effects (place in `/client/public/sounds/`)

- `pistol-shot.mp3` - Gunshot sound effect
- `bat-swing.mp3` - Melee weapon swing sound
- `flamethrower.mp3` - Flamethrower fire sound
- `enemy-growl.mp3` - Enemy creature sounds
- `enemy-death.mp3` - Enemy defeated sound
- `boss-roar.mp3` - Boss monster roar
- `powerup-collect.mp3` - Power-up collection sound
- `health-restore.mp3` - Health restoration sound
- `damage-taken.mp3` - Player damage sound
- `level-complete.mp3` - Level completion sound

### Background Music (place in `/client/public/music/`)

- `stranger-things-theme.mp3` - Main menu music
- `upside-down-theme.mp3` - Level 1 (Demogorgon) background music
- `mind-flayer-theme.mp3` - Level 2 (Mind Flayer) background music
- `vecna-theme.mp3` - Level 3 (Vecna) background music
- `victory-theme.mp3` - Victory cutscene music

### Dedication Screen Music (place in `/client/public/`)

- `turn-around.mp3` - "Turn Around" song from Stranger Things (plays during dedication screen)

## Audio Recommendations

For the best Stranger Things experience, we recommend:

1. **Sound Effects**: Use retro horror game sound effects with a dark, eerie quality
2. **Background Music**: Use atmospheric, synthesizer-heavy tracks reminiscent of the 1980s
3. **Boss Roars**: Use deep, monstrous sounds that increase in intensity from Level 1 to Level 3
4. **Victory Music**: Use uplifting but still eerie music for the victory sequence

## Free Audio Resources

You can find free audio resources at:
- [Freesound.org](https://freesound.org/) - Free sound effects
- [OpenGameArt.org](https://opengameart.org/) - Game audio assets
- [Incompetech.com](https://incompetech.com/) - Royalty-free music
- [Purple Planet Music](https://www.purple-planet.com/) - Free background music

## Audio Format

All audio files should be in MP3 format for web compatibility. Recommended specifications:
- **Sample Rate**: 44.1 kHz
- **Bit Rate**: 128-192 kbps (good balance between quality and file size)
- **Channels**: Stereo

## Volume Levels

The game automatically manages volume levels:
- Sound Effects: 50% base volume (can be adjusted per sound)
- Background Music: 30% base volume with fade in/out
- Use the mute button in the top-right corner to toggle all audio

## Note on Missing Files

If audio files are missing, the game will:
- Continue to function normally
- Log warnings to the browser console
- Not play the missing sounds/music

The game is fully playable without audio, but the experience is significantly enhanced with sound.
