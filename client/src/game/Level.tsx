import { useRef, useMemo } from 'react';
import { usePlane } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, LEVEL_CONFIG } from './store';

// Floating particle/spore effect for Upside Down atmosphere
function UpsideDownParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 500;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      // Slow upward drift
      const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArray[i * 3 + 1] += 0.01;
        if (posArray[i * 3 + 1] > 30) posArray[i * 3 + 1] = 0;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        color="#ff4444" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Vine-like tendrils growing from ground
function VineTendril({ position, height = 3, rotation = 0 }: { position: [number, number, number], height?: number, rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.15, height, 8]} />
        <meshStandardMaterial 
          color="#1a0808"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {/* Branching tendrils */}
      {[0.3, 0.6, 0.8].map((h, i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(i * 2) * 0.3,
            height * h,
            Math.cos(i * 2) * 0.2
          ]}
          rotation={[0.5, i, 0.3 + i * 0.2]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.05, height * 0.3]} />
          <meshStandardMaterial color="#0a0404" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// Dead/corrupted tree
function DeadTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.5, 6, 8]} />
        <meshStandardMaterial 
          color="#1a1010"
          roughness={1}
        />
      </mesh>
      {/* Dead branches */}
      {[1, 2, 3, 4].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(i * 1.5) * 1,
            2 + i * 0.5,
            Math.cos(i * 1.5) * 0.5
          ]}
          rotation={[0.3, i * 0.7, Math.sin(i) * 0.5]}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.1, 2 + Math.random()]} />
          <meshStandardMaterial color="#0d0808" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Level() {
  const currentLevel = useGameStore(state => state.currentLevel);
  const levelConfig = LEVEL_CONFIG[currentLevel];
  
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static'
  }));

  // Level-specific colors
  const levelColors = {
    1: { ground: '#1a0808', fog: '#200505', ambient: '#330000' },  // Dark red
    2: { ground: '#0a0a15', fog: '#100520', ambient: '#200030' },  // Dark purple
    3: { ground: '#0a0505', fog: '#150000', ambient: '#400000' },  // Blood red
  };

  const colors = levelColors[currentLevel];

  return (
    <>
      {/* Ground - organic, corrupted */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshStandardMaterial 
          color={colors.ground}
          roughness={0.95} 
          metalness={0.05}
        />
      </mesh>
      
      {/* Organic pattern overlay */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#220808"
          roughness={1}
          transparent
          opacity={0.5}
          wireframe
        />
      </mesh>

      {/* Atmospheric fog */}
      <fog attach="fog" color={colors.fog} near={5} far={60} />
      
      {/* Ambient Lighting - Upside Down red hue */}
      <ambientLight intensity={0.15} color={colors.ambient} />
      
      {/* Main dramatic lighting */}
      <directionalLight 
        position={[10, 30, 10]} 
        intensity={0.5} 
        color="#ff2200"
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>

      {/* Accent lights for atmosphere */}
      <pointLight position={[-20, 10, -20]} color="#ff0000" intensity={1} distance={40} />
      <pointLight position={[20, 8, 20]} color="#880000" intensity={0.8} distance={30} />
      
      {/* Floating particles */}
      <UpsideDownParticles />

      {/* Vine tendrils scattered around */}
      {[...Array(20)].map((_, i) => (
        <VineTendril 
          key={i}
          position={[
            (Math.random() - 0.5) * 60,
            0,
            (Math.random() - 0.5) * 60
          ]}
          height={2 + Math.random() * 4}
          rotation={Math.random() * Math.PI * 2}
        />
      ))}

      {/* Dead trees */}
      <DeadTree position={[-15, 3, -20]} />
      <DeadTree position={[20, 3, -25]} />
      <DeadTree position={[-25, 3, 15]} />
      <DeadTree position={[30, 3, 10]} />

      {/* Rocky/organic obstacles */}
      <mesh position={[-10, 1.5, -15]} castShadow receiveShadow>
        <dodecahedronGeometry args={[3]} />
        <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[15, 1, 10]} castShadow receiveShadow>
        <icosahedronGeometry args={[2]} />
        <meshStandardMaterial color="#150808" roughness={0.95} />
      </mesh>
      <mesh position={[8, 2, -20]} castShadow receiveShadow>
        <octahedronGeometry args={[2.5]} />
        <meshStandardMaterial color="#0d0505" roughness={0.85} />
      </mesh>

      {/* Glowing rift/portal effect in sky */}
      <mesh position={[0, 25, -30]} rotation={[0.3, 0, 0]}>
        <ringGeometry args={[5, 8, 32]} />
        <meshBasicMaterial 
          color="#ff0000" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 25, -30]} rotation={[0.3, 0, 0]}>
        <ringGeometry args={[3, 5, 32]} />
        <meshBasicMaterial 
          color="#ff4400" 
          transparent 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}
