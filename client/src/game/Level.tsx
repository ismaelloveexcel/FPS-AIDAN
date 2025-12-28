import { useRef, useMemo } from 'react';
import { usePlane } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './store';

// Floating particle/spore effect for Upside Down atmosphere
function UpsideDownParticles({ color = '#ff4444' }: { color?: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 1000; // Increased particle count for better visuals
  
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
        size={0.2}  // Slightly larger particles
        color={color}
        transparent 
        opacity={0.75} // Slightly more visible
        sizeAttenuation
        blending={THREE.AdditiveBlending} // Add glow effect
      />
    </points>
  );
}

// Animated portal for Level 1
function UpsideDownPortal() {
  const portalRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (portalRef.current) {
      portalRef.current.rotation.z = clock.getElapsedTime() * 0.3;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -clock.getElapsedTime() * 0.5;
    }
    if (outerRingRef.current) {
      // Pulsing opacity effect
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.2 + 0.5;
      (outerRingRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });

  return (
    <group ref={portalRef} position={[0, 25, -30]} rotation={[0.3, 0, 0]}>
      {/* Outer ring */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[5, 8, 32]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.4} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Inner ring */}
      <mesh ref={innerRingRef}>
        <ringGeometry args={[3, 5, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Portal center glow */}
      <mesh>
        <circleGeometry args={[3, 32]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Portal light */}
      <pointLight color="#ff0000" intensity={5} distance={30} />
    </group>
  );
}

// Lightning effect for Mind Flayer level
function LightningEffect() {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      // Random lightning flashes
      const flash = Math.random() > 0.995;
      lightRef.current.intensity = flash ? 10 + Math.random() * 20 : 0.5;
    }
  });

  return (
    <>
      <pointLight ref={lightRef} position={[0, 40, -20]} color="#8844ff" distance={100} />
      <pointLight position={[-30, 35, 10]} color="#6622cc" intensity={0.3} distance={50} />
      <pointLight position={[30, 35, -10]} color="#4400aa" intensity={0.3} distance={50} />
    </>
  );
}

// Storm clouds for Mind Flayer level
function StormClouds() {
  const cloudsRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <group ref={cloudsRef} position={[0, 35, 0]}>
      {[...Array(15)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 80,
            Math.random() * 10,
            (Math.random() - 0.5) * 80
          ]}
        >
          <sphereGeometry args={[5 + Math.random() * 8, 8, 6]} />
          <meshStandardMaterial 
            color="#1a0a2a"
            emissive="#2a1040"
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

// Floating debris for Vecna level
function FloatingDebris() {
  const debrisRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (debrisRef.current) {
      debrisRef.current.children.forEach((child, i) => {
        child.position.y = 5 + Math.sin(clock.getElapsedTime() * 0.5 + i) * 2;
        child.rotation.x = clock.getElapsedTime() * 0.1 * (i % 2 ? 1 : -1);
        child.rotation.z = clock.getElapsedTime() * 0.15 * (i % 3 ? 1 : -1);
      });
    }
  });

  return (
    <group ref={debrisRef}>
      {[...Array(20)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            5 + Math.random() * 10,
            (Math.random() - 0.5) * 50
          ]}
          castShadow
        >
          <boxGeometry args={[
            0.5 + Math.random() * 1.5,
            0.5 + Math.random() * 1.5,
            0.5 + Math.random() * 1.5
          ]} />
          <meshStandardMaterial 
            color="#1a0a0a"
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// Grandfather clock for Vecna level
function GrandfatherClock({ position }: { position: [number, number, number] }) {
  const pendulumRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (pendulumRef.current) {
      pendulumRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Clock body */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 4, 0.8]} />
        <meshStandardMaterial color="#1a0505" roughness={0.8} />
      </mesh>
      {/* Clock face */}
      <mesh position={[0, 1.2, 0.45]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#ffddaa" />
      </mesh>
      {/* Clock hands glow */}
      <pointLight position={[0, 1.2, 0.5]} color="#ffaa00" intensity={0.5} distance={3} />
      {/* Pendulum */}
      <mesh ref={pendulumRef} position={[0, -0.5, 0.45]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
        <meshStandardMaterial color="#aa8800" metalness={0.8} />
      </mesh>
    </group>
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
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.5, 6, 8]} />
        <meshStandardMaterial color="#1a1010" roughness={1} />
      </mesh>
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

// Creel House ruins for Vecna level
function CreelHouseRuins() {
  return (
    <group position={[0, 0, -25]}>
      {/* Ruined walls */}
      <mesh position={[-8, 3, 0]} castShadow>
        <boxGeometry args={[0.5, 6, 10]} />
        <meshStandardMaterial color="#1a0a0a" roughness={0.95} />
      </mesh>
      <mesh position={[8, 2, 0]} castShadow>
        <boxGeometry args={[0.5, 4, 8]} />
        <meshStandardMaterial color="#150808" roughness={0.95} />
      </mesh>
      {/* Broken pillars */}
      <mesh position={[-4, 2, 5]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 4]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
      <mesh position={[4, 1.5, 5]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 3]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
      {/* Floor tiles */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#0d0505" roughness={1} />
      </mesh>
    </group>
  );
}

export function Level() {
  const currentLevel = useGameStore(state => state.currentLevel);
  
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static'
  }));

  // Level-specific configurations
  const levelConfig = {
    1: { 
      ground: '#1a0808', 
      fog: '#200505', 
      ambient: '#330000',
      particleColor: '#ff4444',
      skyColor: '#050000'
    },
    2: { 
      ground: '#0a0a15', 
      fog: '#100520', 
      ambient: '#200030',
      particleColor: '#aa44ff',
      skyColor: '#050010'
    },
    3: { 
      ground: '#0a0505', 
      fog: '#150000', 
      ambient: '#400000',
      particleColor: '#ff2200',
      skyColor: '#080000'
    },
  };

  const config = levelConfig[currentLevel];

  return (
    <>
      {/* Ground */}
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshStandardMaterial 
          color={config.ground}
          roughness={0.95} 
          metalness={0.05}
        />
      </mesh>
      
      {/* Ground pattern overlay */}
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

      {/* Fog */}
      <fog attach="fog" color={config.fog} near={5} far={70} />
      
      {/* Ambient Lighting - slightly increased for better visibility */}
      <ambientLight intensity={0.2} color={config.ambient} />
      
      {/* Main lighting - Enhanced for dramatic effect */}
      <directionalLight 
        position={[10, 35, 10]} 
        intensity={0.7} 
        color={currentLevel === 2 ? '#8844ff' : '#ff2200'}
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50, 0.1, 100]} />
      </directionalLight>

      {/* Accent lights - More dramatic positioning and intensity */}
      <pointLight position={[-25, 15, -25]} color={currentLevel === 2 ? '#6600ff' : '#ff0000'} intensity={1.5} distance={50} castShadow />
      <pointLight position={[25, 12, 25]} color={currentLevel === 2 ? '#4400aa' : '#880000'} intensity={1.2} distance={40} castShadow />
      
      {/* Additional rim lighting for depth */}
      <pointLight position={[0, 5, -40]} color={currentLevel === 3 ? '#ff0000' : currentLevel === 2 ? '#aa00ff' : '#880000'} intensity={2} distance={60} />
      
      {/* Floating particles */}
      <UpsideDownParticles color={config.particleColor} />

      {/* Level 1: Upside Down - Basic */}
      {currentLevel === 1 && (
        <>
          {/* Vine tendrils */}
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

          {/* Animated Portal in sky */}
          <UpsideDownPortal />
        </>
      )}

      {/* Level 2: Mind Flayer - Storm */}
      {currentLevel === 2 && (
        <>
          <StormClouds />
          <LightningEffect />
          
          {/* Tentacles from ground */}
          {[...Array(15)].map((_, i) => (
            <VineTendril 
              key={i}
              position={[
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 60
              ]}
              height={4 + Math.random() * 6}
              rotation={Math.random() * Math.PI * 2}
            />
          ))}

          {/* Shadow pillars */}
          {[...Array(8)].map((_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i / 8 * Math.PI * 2) * 25,
                4,
                Math.sin(i / 8 * Math.PI * 2) * 25
              ]}
              castShadow
            >
              <cylinderGeometry args={[0.5, 0.8, 8]} />
              <meshStandardMaterial color="#0a0a20" emissive="#200040" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </>
      )}

      {/* Level 3: Vecna's Lair */}
      {currentLevel === 3 && (
        <>
          <CreelHouseRuins />
          <FloatingDebris />
          
          {/* Grandfather clocks */}
          <GrandfatherClock position={[-12, 2, -15]} />
          <GrandfatherClock position={[12, 2, -18]} />
          <GrandfatherClock position={[0, 2, -35]} />
          
          {/* More vines - Vecna's tendrils */}
          {[...Array(30)].map((_, i) => (
            <VineTendril 
              key={i}
              position={[
                (Math.random() - 0.5) * 50,
                0,
                (Math.random() - 0.5) * 50
              ]}
              height={3 + Math.random() * 5}
              rotation={Math.random() * Math.PI * 2}
            />
          ))}

          {/* Ominous red glow */}
          <pointLight position={[0, 15, -30]} color="#ff0000" intensity={3} distance={40} />
        </>
      )}

      {/* Obstacles for all levels */}
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
    </>
  );
}
