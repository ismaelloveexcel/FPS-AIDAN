import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, BossType } from './store';
import { audioManager } from './AudioManager';

interface BossProps {
  id: string;
  type: BossType;
  position: [number, number, number];
}

// Demogorgon - Level 1 Boss (using GLB model)
function Demogorgon({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const lastRoarTime = useRef(0);
  const { scene } = useGLTF('/demogorgon.glb');
  
  const [bodyRef] = useBox(() => ({
    mass: 0,
    position,
    args: [3, 5, 2],
    userData: { isBoss: true, bossType: 'demogorgon' }
  }));

  // Clone the scene to avoid shared state issues
  const clonedScene = scene.clone();
  
  // Set userData on all meshes for hit detection
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData = { isBoss: true, bossType: 'demogorgon' };
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Initial roar when boss spawns
    setTimeout(() => audioManager.playSound('boss-roar', 0.6), 500);
  }, [clonedScene]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Menacing sway animation
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.3;
      
      // Periodic roar
      const now = Date.now();
      if (now - lastRoarTime.current > 10000 + Math.random() * 5000) {
        audioManager.playSound('boss-roar', 0.5);
        lastRoarTime.current = now;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible hitbox */}
      <mesh ref={bodyRef as any} visible={false}>
        <boxGeometry args={[3, 5, 2]} />
      </mesh>
      
      {/* 3D Model */}
      <primitive object={clonedScene} scale={2} position={[0, -2, 0]} />
      
      {/* Enhanced eerie red glow with multiple lights */}
      <pointLight color="#ff0000" intensity={4} distance={18} position={[0, 2, 0]} />
      <pointLight color="#aa0000" intensity={2} distance={10} position={[0, 1, 2]} />
      <pointLight color="#ff2200" intensity={1.5} distance={8} position={[0, 0, -2]} />
      
      {/* Pulsing glow sphere around boss */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// Mind Flayer - Level 2 Boss (using GLB model)
function MindFlayer({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const lastRoarTime = useRef(0);
  const { scene } = useGLTF('/mindflayer.glb');
  
  const [bodyRef] = useBox(() => ({
    mass: 0,
    position,
    args: [6, 8, 4],
    userData: { isBoss: true, bossType: 'mindflayer' }
  }));

  const clonedScene = scene.clone();
  
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData = { isBoss: true, bossType: 'mindflayer' };
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Initial roar
    setTimeout(() => audioManager.playSound('boss-roar', 0.7), 500);
  }, [clonedScene]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Swirling, ethereal movement
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 1.5) * 0.5;
      
      // Periodic roar
      const now = Date.now();
      if (now - lastRoarTime.current > 12000 + Math.random() * 6000) {
        audioManager.playSound('boss-roar', 0.6);
        lastRoarTime.current = now;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible hitbox */}
      <mesh ref={bodyRef as any} visible={false}>
        <boxGeometry args={[6, 8, 4]} />
      </mesh>
      
      {/* 3D Model */}
      <primitive object={clonedScene} scale={3} position={[0, -3, 0]} />
      
      {/* Enhanced purple shadow glow with multiple lights */}
      <pointLight color="#8800ff" intensity={5} distance={25} position={[0, 0, 0]} />
      <pointLight color="#aa44ff" intensity={3} distance={15} position={[2, 2, 0]} />
      <pointLight color="#6600cc" intensity={2} distance={12} position={[-2, 1, 0]} />
      
      {/* Swirling energy sphere */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[4.5, 16, 16]} />
        <meshBasicMaterial color="#8800ff" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// Vecna - Level 3 Final Boss (using GLB model)
function Vecna({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const lastRoarTime = useRef(0);
  const { scene } = useGLTF('/vecna.glb');
  
  const [bodyRef] = useBox(() => ({
    mass: 0,
    position,
    args: [3, 7, 2],
    userData: { isBoss: true, bossType: 'vecna' }
  }));

  const clonedScene = scene.clone();
  
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData = { isBoss: true, bossType: 'vecna' };
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Initial roar
    setTimeout(() => audioManager.playSound('boss-roar', 0.8), 500);
  }, [clonedScene]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Floating, menacing presence
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime()) * 0.4;
      
      // Periodic roar - Vecna roars more frequently for tension
      const now = Date.now();
      if (now - lastRoarTime.current > 8000 + Math.random() * 4000) {
        audioManager.playSound('boss-roar', 0.7);
        lastRoarTime.current = now;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Invisible hitbox */}
      <mesh ref={bodyRef as any} visible={false}>
        <boxGeometry args={[3, 7, 2]} />
      </mesh>
      
      {/* 3D Model */}
      <primitive object={clonedScene} scale={2.5} position={[0, -3, 0]} />
      
      {/* Enhanced psychic energy aura with multiple lights */}
      <pointLight color="#ff0000" intensity={6} distance={30} position={[0, 2, 0]} />
      <pointLight color="#440000" intensity={3} distance={15} position={[0, -1, 0]} />
      <pointLight color="#ff2200" intensity={2.5} distance={12} position={[2, 1, 0]} />
      <pointLight color="#880000" intensity={2} distance={10} position={[-2, 1, 0]} />
      
      {/* Pulsing psychic energy sphere */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.15} />
      </mesh>
      
      {/* Tendrils of dark energy */}
      {[0, 1, 2, 3].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 2.5,
            0,
            Math.sin((i / 4) * Math.PI * 2) * 2.5
          ]}
        >
          <cylinderGeometry args={[0.1, 0.05, 3, 8]} />
          <meshBasicMaterial color="#220000" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Preload all GLB models
useGLTF.preload('/demogorgon.glb');
useGLTF.preload('/mindflayer.glb');
useGLTF.preload('/vecna.glb');

export function BossEnemy({ id, type, position }: BossProps) {
  switch (type) {
    case 'demogorgon':
      return <Demogorgon position={position} />;
    case 'mindflayer':
      return <MindFlayer position={position} />;
    case 'vecna':
      return <Vecna position={position} />;
    default:
      return null;
  }
}

export function BossManager() {
  const boss = useGameStore(state => state.boss);
  const isPlaying = useGameStore(state => state.isPlaying);
  const showLevelIntro = useGameStore(state => state.showLevelIntro);
  const showLevelComplete = useGameStore(state => state.showLevelComplete);

  if (!isPlaying || !boss || showLevelIntro || showLevelComplete) return null;

  return <BossEnemy {...boss} />;
}
