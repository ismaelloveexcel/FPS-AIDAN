import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { useGameStore, BossType } from './store';

interface BossProps {
  id: string;
  type: BossType;
  position: [number, number, number];
}

// Demogorgon - Level 1 Boss (flower-headed creature)
function Demogorgon({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [bodyRef] = useBox(() => ({
    mass: 0,
    position,
    args: [3, 5, 2],
    userData: { isBoss: true, bossType: 'demogorgon' }
  }));

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Menacing sway animation
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh ref={bodyRef as any} castShadow receiveShadow>
        <capsuleGeometry args={[1, 3, 8, 16]} />
        <meshStandardMaterial 
          color="#3d2f2f" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Petal-like head segments */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 0.8,
            3.5,
            Math.sin((i / 6) * Math.PI * 2) * 0.8
          ]}
          rotation={[
            Math.cos((i / 6) * Math.PI * 2) * 0.5,
            (i / 6) * Math.PI * 2,
            0.3
          ]}
          castShadow
        >
          <coneGeometry args={[0.6, 1.8, 4]} />
          <meshStandardMaterial 
            color="#8b0000" 
            emissive="#4a0000"
            emissiveIntensity={0.5}
            roughness={0.7}
          />
        </mesh>
      ))}
      
      {/* Inner mouth glow */}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.5]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0.8} />
      </mesh>
      
      {/* Claws */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.2, 1, 0.5]}>
          {[0, 1, 2].map((finger) => (
            <mesh 
              key={finger} 
              position={[side * (finger * 0.15), -0.5, finger * 0.2]}
              rotation={[0.3, 0, side * 0.2]}
              castShadow
            >
              <coneGeometry args={[0.08, 0.8, 8]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Eerie glow */}
      <pointLight color="#ff0000" intensity={2} distance={10} position={[0, 2, 0]} />
    </group>
  );
}

// Mind Flayer - Level 2 Boss (giant shadow spider creature)
function MindFlayer({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [bodyRef] = useBox(() => ({
    mass: 0,
    position,
    args: [6, 8, 4],
    userData: { isBoss: true, bossType: 'mindflayer' }
  }));

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Swirling, ethereal movement
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 1.5) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main body - shadowy mass */}
      <mesh ref={bodyRef as any} castShadow>
        <icosahedronGeometry args={[3, 2]} />
        <meshStandardMaterial 
          color="#1a0a1a" 
          emissive="#2d0a2d"
          emissiveIntensity={0.3}
          roughness={1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Spider-like legs */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[0, -1, 0]} rotation={[0, angle, 0]}>
            {/* Upper leg */}
            <mesh position={[2.5, 1, 0]} rotation={[0, 0, -0.8]} castShadow>
              <cylinderGeometry args={[0.15, 0.08, 3]} />
              <meshStandardMaterial 
                color="#0a0a0a" 
                emissive="#1a0a1a"
                roughness={0.8}
              />
            </mesh>
            {/* Lower leg */}
            <mesh position={[4.5, -1.5, 0]} rotation={[0, 0, 0.5]} castShadow>
              <cylinderGeometry args={[0.08, 0.03, 4]} />
              <meshStandardMaterial 
                color="#0a0a0a" 
                emissive="#1a0a1a"
                roughness={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* Head with multiple eyes */}
      <mesh position={[0, 3, 1]}>
        <dodecahedronGeometry args={[1.5]} />
        <meshStandardMaterial 
          color="#0d0d0d"
          emissive="#200020"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Glowing eyes */}
      {[[-0.5, 3.5, 1.8], [0.5, 3.5, 1.8], [0, 3, 2.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.2]} />
          <meshBasicMaterial color="#ff0044" />
        </mesh>
      ))}

      {/* Shadow particles */}
      <pointLight color="#8800ff" intensity={3} distance={15} position={[0, 0, 0]} />
    </group>
  );
}

// Vecna - Level 3 Final Boss (humanoid horror)
function Vecna({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [bodyRef] = useBox(() => ({
    mass: 0,
    position,
    args: [3, 7, 2],
    userData: { isBoss: true, bossType: 'vecna' }
  }));

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Floating, menacing presence
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime()) * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Torso */}
      <mesh ref={bodyRef as any} position={[0, 0, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.8, 2, 8, 16]} />
        <meshStandardMaterial 
          color="#2a1a1a"
          roughness={0.95}
          metalness={0.1}
        />
      </mesh>

      {/* Scarred/decayed skin texture overlay */}
      <mesh position={[0, 0, 0.1]} castShadow>
        <capsuleGeometry args={[0.82, 2, 8, 16]} />
        <meshStandardMaterial 
          color="#3d2020"
          roughness={1}
          transparent
          opacity={0.7}
          wireframe
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial 
          color="#2a1515"
          roughness={0.9}
        />
      </mesh>

      {/* Exposed skull/face detail */}
      <mesh position={[0, 2.5, 0.4]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial 
          color="#1a0a0a"
          emissive="#330000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Glowing eyes */}
      {[[-0.25, 2.6, 0.6], [0.25, 2.6, 0.6]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.12]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      ))}

      {/* Arms - twisted and elongated */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Upper arm */}
          <mesh position={[side * 1.2, 0.5, 0]} rotation={[0, 0, side * 0.5]} castShadow>
            <capsuleGeometry args={[0.15, 1.2, 4, 8]} />
            <meshStandardMaterial color="#2a1a1a" roughness={0.9} />
          </mesh>
          {/* Forearm */}
          <mesh position={[side * 1.8, -0.3, 0.3]} rotation={[0.3, 0, side * 0.3]} castShadow>
            <capsuleGeometry args={[0.12, 1.5, 4, 8]} />
            <meshStandardMaterial color="#2a1a1a" roughness={0.9} />
          </mesh>
          {/* Clawed hand */}
          <mesh position={[side * 2.2, -1, 0.5]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#1a0a0a" />
          </mesh>
          {/* Finger claws */}
          {[0, 1, 2, 3, 4].map((finger) => (
            <mesh 
              key={finger}
              position={[
                side * 2.3 + side * (finger - 2) * 0.08,
                -1.3,
                0.5 + finger * 0.05
              ]}
              rotation={[0.5, 0, side * 0.1]}
              castShadow
            >
              <coneGeometry args={[0.04, 0.4, 4]} />
              <meshStandardMaterial color="#0a0505" metalness={0.3} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Vines/tendrils from body */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * 1,
              -1.5 + Math.sin(i) * 0.3,
              Math.sin(angle) * 0.5
            ]}
            rotation={[Math.random(), angle, 0.5]}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.02, 2 + Math.random()]} />
            <meshStandardMaterial 
              color="#1a1a0a"
              roughness={0.9}
            />
          </mesh>
        );
      })}

      {/* Psychic energy aura */}
      <pointLight color="#ff0000" intensity={4} distance={20} position={[0, 2, 0]} />
      <pointLight color="#440000" intensity={2} distance={10} position={[0, -1, 0]} />
    </group>
  );
}

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

  if (!isPlaying || !boss || showLevelIntro) return null;

  return <BossEnemy {...boss} />;
}
