import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useState } from 'react';
import { Vector3 } from 'three';
import { useGameStore } from './store';

interface EnemyProps {
  id: string;
  position: [number, number, number];
}

export function Enemy({ id, position }: EnemyProps) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1, 1, 1],
    userData: { id, isEnemy: true }
  }));
  
  const takeDamage = useGameStore(state => state.takeDamage);
  const playerPosition = new Vector3(); // Ideally we get this from store or context, but simplified for now: assume player is near origin or we track player ref

  // Simple AI: Move towards origin (0,0,0) as basic behavior or random
  useFrame((state) => {
    // Basic "hover" or bobbing
    if (ref.current) {
      // Logic to move towards player could go here
      // For MVP, they are static targets or bounce
    }
  });

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#ff0044" 
        emissive="#550000"
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

export function EnemyManager() {
  const enemies = useGameStore(state => state.enemies);
  const spawnEnemy = useGameStore(state => state.spawnEnemy);
  const isPlaying = useGameStore(state => state.isPlaying);
  
  // Spawner logic
  useFrame(({ clock }) => {
    if (!isPlaying) return;
    
    // Spawn every 2 seconds roughly if less than 10 enemies
    if (Math.floor(clock.getElapsedTime()) % 2 === 0 && enemies.length < 10 && Math.random() > 0.95) {
      const id = Math.random().toString(36).substr(2, 9);
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Ensure unique ID in spawn call
      if (!enemies.find(e => e.id === id)) {
        spawnEnemy(id, [x, 5, z]); // Spawn in air
      }
    }
  });

  return (
    <>
      {enemies.map(enemy => (
        <Enemy key={enemy.id} {...enemy} />
      ))}
    </>
  );
}
