# Upside Down Shooter Game

## Overview

A first-person shooter game inspired by Stranger Things, built with React Three Fiber for 3D rendering and physics. Players battle through levels fighting iconic enemies like Demogorgons, the Mind Flayer, and Vecna in an atmospheric Upside Down environment. The game features multiple weapons, power-ups, boss fights with multiple phases, and a persistent leaderboard system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript** single-page application with Vite bundler
- **React Three Fiber** (@react-three/fiber) for 3D scene rendering
- **@react-three/cannon** for physics simulation (collision detection, player movement)
- **@react-three/drei** for useful 3D helpers and abstractions
- **Zustand** for game state management (health, score, weapons, levels, boss phases)
- **Wouter** for client-side routing (game page, asset generator page)
- **TanStack Query** for server state and API calls
- **shadcn/ui** components with Tailwind CSS for UI elements (menus, HUD, leaderboard)

### Backend Architecture
- **Express.js** server with TypeScript
- RESTful API endpoints defined in `shared/routes.ts` with Zod validation
- **Drizzle ORM** for database operations
- Shared schema definitions between client and server in `shared/` directory
- Development uses Vite middleware for hot reloading
- Production serves static files from built output

### Data Storage
- **PostgreSQL** database via Drizzle ORM
- Simple schema with `scores` table for leaderboard (id, username, score, createdAt)
- Connection through `DATABASE_URL` environment variable
- Migrations managed via drizzle-kit

### Game Architecture
- Component-based 3D scene structure in `client/src/game/`:
  - `Player.tsx` - First-person controller with WASD movement and physics
  - `Weapon.tsx` - Multiple weapon types (pistol, nail bat, flamethrower)
  - `Enemy.tsx` - AI-controlled enemies with chase behavior
  - `Boss.tsx` - Multi-phase boss encounters with GLB model support
  - `Level.tsx` - Environmental rendering with particle effects
  - `PowerUp.tsx` - Collectible items (Eggos, skateboard, shield)
  - `store.ts` - Zustand store with game state, difficulty settings, and weapon stats

### API Structure
- `GET /api/scores` - Retrieve top 10 scores
- `POST /api/scores` - Submit new score with username validation
- Meshy API integration endpoints for 3D asset generation (text-to-3D, image-to-3D)

## External Dependencies

### Third-Party Services
- **Meshy API** - AI-powered 3D model generation (requires `MESHY_API_KEY` environment variable)
- **PostgreSQL** - Database for score persistence (requires `DATABASE_URL` environment variable)
- **Google Fonts** - Typography (Nosifer, Creepster, Special Elite, Bebas Neue, Share Tech Mono)

### Key NPM Packages
- `three` / `@react-three/fiber` / `@react-three/drei` / `@react-three/cannon` - 3D rendering and physics
- `zustand` - Lightweight state management
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `@tanstack/react-query` - Server state management
- `zod` - Schema validation for API and forms
- `express` / `express-session` - Server framework
- Full shadcn/ui component library with Radix primitives