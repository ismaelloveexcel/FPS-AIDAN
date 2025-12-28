import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Raycaster, Vector2, Group, Object3D } from 'three';
import { useGameStore } from './store';

const WEAPON_OFFSET = new Vector3(0.5, -0.3, 0.5);

export function Weapon() {
  const { camera, scene } = useThree();
  const weaponRef = useRef<Group>(null);
  const raycaster = useRef(new Raycaster());
  const removeEnemy = useGameStore(state => state.removeEnemy);
  const damageBoss = useGameStore(state => state.damageBoss);
  const addScore = useGameStore(state => state.addScore);
  const isPlaying = useGameStore(state => state.isPlaying);
  const showLevelIntro = useGameStore(state => state.showLevelIntro);
  
  const [isRecoiling, setIsRecoiling] = useState(false);
  const [muzzleFlash, setMuzzleFlash] = useState(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isPlaying || showLevelIntro || document.pointerLockElement !== document.body) return;
      
      if (e.button === 0) {
        shoot();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [isPlaying, showLevelIntro]);

  useFrame(() => {
    if (weaponRef.current) {
      weaponRef.current.position.copy(camera.position);
      weaponRef.current.rotation.copy(camera.rotation);
      weaponRef.current.translateX(0.4);
      weaponRef.current.translateY(-0.3 + (isRecoiling ? 0.05 : 0));
      weaponRef.current.translateZ(-0.5 + (isRecoiling ? 0.1 : 0));
    }
  });

  const shoot = () => {
    // Recoil animation
    setIsRecoiling(true);
    setMuzzleFlash(true);
    setTimeout(() => setIsRecoiling(false), 100);
    setTimeout(() => setMuzzleFlash(false), 50);
    
    // Raycast from center of screen
    raycaster.current.setFromCamera(new Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      let obj: Object3D | null = hit.object;
      while (obj) {
        // Check for boss hit
        if (obj.userData?.isBoss) {
          damageBoss(50); // Boss takes 50 damage per hit
          addScore(10);
          return;
        }
        // Check for enemy hit
        if (obj.userData?.isEnemy) {
          removeEnemy(obj.userData.id);
          addScore(100);
          return;
        }
        obj = obj.parent;
      }
    }
  };

  return (
    <group ref={weaponRef}>
      {/* Stranger Things themed weapon - more rugged/makeshift look */}
      
      {/* Main body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.18, 0.7]} />
        <meshStandardMaterial 
          color="#2a2020" 
          roughness={0.7} 
          metalness={0.4} 
        />
      </mesh>
      
      {/* Grip */}
      <mesh position={[0, -0.15, 0.15]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.12]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
      
      {/* Barrel */}
      <mesh position={[0, 0.03, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5]} />
        <meshStandardMaterial color="#151010" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Red energy core - Stranger Things red aesthetic */}
      <mesh position={[0, 0.05, -0.15]}>
        <boxGeometry args={[0.06, 0.06, 0.15]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Side rails */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.08, -0.1]}>
          <boxGeometry args={[0.02, 0.04, 0.4]} />
          <meshStandardMaterial color="#0a0505" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* Muzzle flash effect */}
      {muzzleFlash && (
        <mesh position={[0, 0.03, -0.7]}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Weapon glow */}
      <pointLight 
        color="#ff0000" 
        intensity={0.5} 
        distance={2} 
        position={[0, 0.05, -0.15]} 
      />
    </group>
  );
}
