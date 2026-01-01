import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import * as THREE from 'three';
import { useGameStore, PowerUpType, POWERUP_CONFIG } from './store';
import { audioManager } from './AudioManager';

interface PowerUpProps {
  id: string;
  type: PowerUpType;
  position: [number, number, number];
}

// Eggo waffle model (health)
function EggoModel() {
  return (
    <group>
      {/* Waffle */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#e8c170" roughness={0.8} />
      </mesh>
      {/* Waffle pattern */}
      {[...Array(9)].map((_, i) => (
        <mesh key={i} position={[(i % 3 - 1) * 0.2, 0.06, Math.floor(i / 3 - 1) * 0.2]}>
          <boxGeometry args={[0.15, 0.02, 0.15]} />
          <meshStandardMaterial color="#d4a84b" roughness={0.9} />
        </mesh>
      ))}
      {/* Glow */}
      <pointLight color="#ffcc00" intensity={1} distance={3} />
    </group>
  );
}

// Max's skateboard model (speed boost)
function SkateboardModel() {
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Deck */}
      <mesh>
        <boxGeometry args={[0.3, 0.05, 0.8]} />
        <meshStandardMaterial color="#ff4488" roughness={0.6} />
      </mesh>
      {/* Trucks */}
      {[-0.25, 0.25].map((z) => (
        <mesh key={z} position={[0, -0.05, z]}>
          <boxGeometry args={[0.2, 0.03, 0.08]} />
          <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* Wheels */}
      {[[-0.12, -0.08, -0.25], [0.12, -0.08, -0.25], [-0.12, -0.08, 0.25], [0.12, -0.08, 0.25]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
          <meshStandardMaterial color="#44aaff" />
        </mesh>
      ))}
      {/* Glow */}
      <pointLight color="#ff44ff" intensity={1} distance={3} />
    </group>
  );
}

// Eleven's shield model (protection)
function ShieldModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 2;
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <group>
      {/* Psychic energy sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshBasicMaterial 
          color="#9933ff" 
          transparent 
          opacity={0.6} 
          wireframe 
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.25]} />
        <meshBasicMaterial color="#cc66ff" transparent opacity={0.8} />
      </mesh>
      {/* Glow */}
      <pointLight color="#9933ff" intensity={2} distance={4} />
    </group>
  );
}

export function PowerUp({ id, type, position }: PowerUpProps) {
  const groupRef = useRef<THREE.Group>(null);
  const collectPowerUp = useGameStore(state => state.collectPowerUp);
  
  const [sphereRef] = useSphere(() => ({
    mass: 0,
    position,
    args: [0.5],
    isTrigger: true,
    userData: { isPowerUp: true, powerUpId: id, powerUpType: type },
    onCollide: (e) => {
      if (e.body?.userData?.isPlayer) {
        // Play appropriate sound based on power-up type
        if (type === 'eggo') {
          audioManager.playSound('health-restore', 0.8);
        } else {
          audioManager.playSound('powerup-collect', 0.7);
        }
        collectPowerUp(id);
      }
    }
  }));

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      groupRef.current.rotation.y = clock.getElapsedTime();
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {type === 'eggo' && <EggoModel />}
      {type === 'skateboard' && <SkateboardModel />}
      {type === 'shield' && <ShieldModel />}
    </group>
  );
}

export function PowerUpManager() {
  const powerUps = useGameStore(state => state.powerUps);
  const isPlaying = useGameStore(state => state.isPlaying);
  const showLevelIntro = useGameStore(state => state.showLevelIntro);
  const spawnPowerUp = useGameStore(state => state.spawnPowerUp);
  const currentLevel = useGameStore(state => state.currentLevel);

  // Spawn power-ups periodically
  useEffect(() => {
    if (!isPlaying || showLevelIntro) return;

    const spawnInterval = setInterval(() => {
      // Random chance to spawn power-up
      if (Math.random() > 0.7 && powerUps.length < 3) {
        const types: PowerUpType[] = ['eggo', 'skateboard', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        const position: [number, number, number] = [
          (Math.random() - 0.5) * 30,
          1,
          (Math.random() - 0.5) * 30 - 10
        ];
        spawnPowerUp(type, position);
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(spawnInterval);
  }, [isPlaying, showLevelIntro, powerUps.length, spawnPowerUp]);

  if (!isPlaying || showLevelIntro) return null;

  return (
    <>
      {powerUps.map((powerUp) => (
        <PowerUp key={powerUp.id} {...powerUp} />
      ))}
    </>
  );
}
