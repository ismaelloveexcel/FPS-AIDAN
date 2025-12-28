import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector3 } from 'three';
import { useGameStore } from './store';
import * as THREE from 'three';

interface EnemyProps {
  id: string;
  position: [number, number, number];
}

// Demodog - smaller demogorgon-like creature
export function Enemy({ id, position }: EnemyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1.2, 1.2, 1.5],
    userData: { id, isEnemy: true }
  }));
  
  const currentLevel = useGameStore(state => state.currentLevel);

  // Level-based color schemes
  const colorSchemes = {
    1: { body: '#2a1a1a', accent: '#8b0000', glow: '#ff0000' },
    2: { body: '#1a1a2a', accent: '#4a0050', glow: '#aa00ff' },
    3: { body: '#1a0a0a', accent: '#550000', glow: '#ff2200' },
  };
  
  const colors = colorSchemes[currentLevel];

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Scuttling animation
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 8) * 0.1;
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(clock.getElapsedTime() * 6)) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={ref as any} castShadow receiveShadow>
        {/* Body */}
        <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
        <meshStandardMaterial 
          color={colors.body}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Head petals */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh 
          key={i}
          position={[
            position[0] + Math.cos((i / 5) * Math.PI * 2) * 0.3,
            position[1] + 0.8,
            position[2] + Math.sin((i / 5) * Math.PI * 2) * 0.3
          ]}
          rotation={[
            Math.cos((i / 5) * Math.PI * 2) * 0.3,
            (i / 5) * Math.PI * 2,
            0.2
          ]}
          castShadow
        >
          <coneGeometry args={[0.15, 0.5, 4]} />
          <meshStandardMaterial 
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={0.3}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Glowing core */}
      <mesh position={[position[0], position[1] + 0.6, position[2]]}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color={colors.glow} />
      </mesh>

      {/* Legs */}
      {[-0.4, 0.4].map((x) => (
        [-0.3, 0.3].map((z, i) => (
          <mesh
            key={`${x}-${z}`}
            position={[position[0] + x, position[1] - 0.3, position[2] + z]}
            rotation={[0.3 * (z > 0 ? 1 : -1), 0, 0.2 * (x > 0 ? 1 : -1)]}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.03, 0.5]} />
            <meshStandardMaterial color="#0a0505" roughness={0.8} />
          </mesh>
        ))
      ))}

      {/* Eerie glow */}
      <pointLight 
        color={colors.glow} 
        intensity={0.5} 
        distance={3} 
        position={[position[0], position[1], position[2]]} 
      />
    </group>
  );
}

export function EnemyManager() {
  const enemies = useGameStore(state => state.enemies);
  const spawnEnemy = useGameStore(state => state.spawnEnemy);
  const isPlaying = useGameStore(state => state.isPlaying);
  const showLevelIntro = useGameStore(state => state.showLevelIntro);
  const currentLevel = useGameStore(state => state.currentLevel);
  
  // Spawner logic - spawn minions to support the boss
  useFrame(({ clock }) => {
    if (!isPlaying || showLevelIntro) return;
    
    // Spawn rate increases with level
    const spawnChance = 0.98 - (currentLevel * 0.01);
    const maxEnemies = 3 + currentLevel * 2;
    
    if (Math.floor(clock.getElapsedTime()) % 3 === 0 && enemies.length < maxEnemies && Math.random() > spawnChance) {
      const id = Math.random().toString(36).substr(2, 9);
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      if (!enemies.find(e => e.id === id)) {
        spawnEnemy(id, [x, 2, z]);
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
