import { useEffect, useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from './store';

const SPEED = 5;
const JUMP_FORCE = 4;

export function Player() {
  const { camera } = useThree();
  const [ref, api] = useSphere(() => ({ 
    mass: 1, 
    type: 'Dynamic', 
    position: [0, 2, 0], 
    fixedRotation: true,
    userData: { isPlayer: true }
  }));

  // Velocity reference
  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  // Input state
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW': keys.current.w = true; break;
        case 'KeyS': keys.current.s = true; break;
        case 'KeyA': keys.current.a = true; break;
        case 'KeyD': keys.current.d = true; break;
        case 'Space': keys.current.space = true; break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW': keys.current.w = false; break;
        case 'KeyS': keys.current.s = false; break;
        case 'KeyA': keys.current.a = false; break;
        case 'KeyD': keys.current.d = false; break;
        case 'Space': keys.current.space = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    // Sync camera to physics body
    const pos = ref.current.position; // Actually a Vector3 in R3F context usually, but with cannon hooks we need api.position for reading usually, but ref works for connecting
    
    // Manual camera sync
    // We subscribe to position changes via api.position if we needed exact coords, 
    // but cleaner is to let the camera follow the mesh ref via logic
    // However, @react-three/cannon refs are tricky. 
    // Best practice: copy ref position to camera
    camera.position.copy(new Vector3(
      // @ts-ignore - position exists on the ref in R3F contexts mostly
      ref.current.position.x, 
      ref.current.position.y + 0.5, // Eye level offset
      ref.current.position.z
    ));

    // Movement Logic
    const direction = new Vector3();
    const frontVector = new Vector3(
      0,
      0,
      Number(keys.current.s) - Number(keys.current.w)
    );
    const sideVector = new Vector3(
      Number(keys.current.a) - Number(keys.current.d),
      0,
      0
    );

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    // Jump
    if (keys.current.space && Math.abs(velocity.current[1]) < 0.05) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
    }
  });

  return (
    <mesh ref={ref as any}>
      {/* Invisible collider mesh for player */}
      <sphereGeometry args={[0.5]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}
