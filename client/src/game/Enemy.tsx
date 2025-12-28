import { useBox } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { Vector3 } from 'three';
import { useGameStore, ENEMY_STATS } from './store';
import * as THREE from 'three';

interface EnemyProps {
  id: string;
  position: [number, number, number];
  health: number;
}

// Demodog - smaller demogorgon-like creature with chase AI
export function Enemy({ id, position, health }: EnemyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new Vector3(...position));
  const lastDamageTime = useRef(0);
  
  const { camera } = useThree();
  const currentLevel = useGameStore(state => state.currentLevel);
  const takeDamage = useGameStore(state => state.takeDamage);
  const isPlaying = useGameStore(state => state.isPlaying);
  
  const stats = ENEMY_STATS[currentLevel];

  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1.2, 1.2, 1.5],
    userData: { id, isEnemy: true },
    onCollide: (e) => {
      // Check if collided with player
      if (e.body?.userData?.isPlayer) {
        const now = Date.now();
        if (now - lastDamageTime.current > 1000) { // Damage cooldown
          takeDamage(stats.damage);
          lastDamageTime.current = now;
        }
      }
    }
  }));

  // Subscribe to position updates
  useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => {
      currentPos.current.set(p[0], p[1], p[2]);
    });
    return unsubscribe;
  }, [api.position]);

  // Level-based color schemes
  const colorSchemes = {
    1: { body: '#2a1a1a', accent: '#8b0000', glow: '#ff0000' },
    2: { body: '#1a1a2a', accent: '#4a0050', glow: '#aa00ff' },
    3: { body: '#1a0a0a', accent: '#550000', glow: '#ff2200' },
  };
  
  const colors = colorSchemes[currentLevel];

  useFrame(({ clock }) => {
    if (!isPlaying) return;
    
    // Chase AI - move towards player (camera position)
    const playerPos = camera.position;
    const direction = new Vector3()
      .subVectors(playerPos, currentPos.current)
      .normalize();
    
    // Move towards player
    const speed = stats.speed;
    api.velocity.set(
      direction.x * speed,
      0, // Keep on ground
      direction.z * speed
    );

    // Animation
    if (groupRef.current) {
      // Face the player
      groupRef.current.lookAt(playerPos.x, groupRef.current.position.y, playerPos.z);
      // Scuttling animation
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 8) * 0.1;
    }
  });

  // Health-based visual feedback
  const maxHealth = ENEMY_STATS[currentLevel].health;
  const healthPercent = health / maxHealth;
  const damageGlow = healthPercent < 1 ? 0.5 + (1 - healthPercent) * 0.5 : 0.3;

  return (
    <group ref={groupRef} position={position}>
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
            Math.cos((i / 5) * Math.PI * 2) * 0.3,
            0.8,
            Math.sin((i / 5) * Math.PI * 2) * 0.3
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
            emissiveIntensity={damageGlow}
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Glowing core */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color={colors.glow} />
      </mesh>

      {/* Legs */}
      {[-0.4, 0.4].map((x) => (
        [-0.3, 0.3].map((z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x, -0.3, z]}
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
        intensity={0.5 + damageGlow} 
        distance={3} 
      />
    </group>
  );
}

export function EnemyManager() {
  const enemies = useGameStore(state => state.enemies);
  const spawnEnemy = useGameStore(state => state.spawnEnemy);
  const isPlaying = useGameStore(state => state.isPlaying);
  const showLevelIntro = useGameStore(state => state.showLevelIntro);
  const showLevelComplete = useGameStore(state => state.showLevelComplete);
  const currentLevel = useGameStore(state => state.currentLevel);
  
  // Spawner logic - spawn minions to support the boss
  useFrame(({ clock }) => {
    if (!isPlaying || showLevelIntro || showLevelComplete) return;
    
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
