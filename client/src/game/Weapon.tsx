import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Raycaster } from 'three';
import { useGameStore } from './store';

const WEAPON_OFFSET = new Vector3(0.5, -0.3, 0.5); // Right hand side
const SHOOT_SOUND = new Audio('/sounds/shoot.mp3'); // Placeholder, won't play if missing

export function Weapon() {
  const { camera, scene } = useThree();
  const weaponRef = useRef<THREE.Group>(null);
  const raycaster = useRef(new Raycaster());
  const removeEnemy = useGameStore(state => state.removeEnemy);
  const addScore = useGameStore(state => state.addScore);
  const isPlaying = useGameStore(state => state.isPlaying);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isPlaying || document.pointerLockElement !== document.body) return;
      
      if (e.button === 0) { // Left click
        shoot();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [isPlaying]);

  useFrame(() => {
    if (weaponRef.current) {
      // Weapon sway/bobbing could go here
      weaponRef.current.position.copy(camera.position);
      weaponRef.current.rotation.copy(camera.rotation);
      weaponRef.current.translateX(0.4);
      weaponRef.current.translateY(-0.3);
      weaponRef.current.translateZ(-0.5);
    }
  });

  const shoot = () => {
    // Recoil animation logic could go here
    
    // Raycast from center of screen
    raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      // Check if we hit an enemy
      // We look for objects with userData.isEnemy
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        if (obj.userData?.isEnemy) {
          removeEnemy(obj.userData.id);
          addScore(100);
          
          // Visual effect for hit could spawn here
          break;
        }
        obj = obj.parent;
      }
    }
  };

  return (
    <group ref={weaponRef}>
      {/* Simple Sci-fi Gun Model */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.15, 0.6]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Barrel */}
      <mesh position={[0, 0.05, -0.35]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Energy Glow */}
      <mesh position={[0, 0.05, -0.4]}>
        <boxGeometry args={[0.04, 0.04, 0.1]} />
        <meshBasicMaterial color="#0ff" />
      </mesh>
    </group>
  );
}
