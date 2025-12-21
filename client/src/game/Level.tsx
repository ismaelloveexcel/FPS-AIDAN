import { usePlane } from '@react-three/cannon';

export function Level() {
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: 'Static'
  }));

  return (
    <>
      <mesh ref={ref as any} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8} 
          metalness={0.2} 
        />
        {/* Grid pattern overlay */}
        <gridHelper args={[100, 100, 0x00ffff, 0x222222]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} />
      </mesh>
      
      {/* Ambient Lighting */}
      <ambientLight intensity={0.2} />
      
      {/* Sun/Moon light */}
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>

      {/* Decorative environment boxes */}
      <mesh position={[-10, 2.5, -15]} castShadow receiveShadow>
        <boxGeometry args={[5, 5, 5]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[15, 1.5, 10]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </>
  );
}
