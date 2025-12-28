import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Raycaster, Vector2, Group, Object3D } from 'three';
import { useGameStore, WEAPON_STATS } from './store';

// Pistol model
function PistolModel({ isRecoiling, muzzleFlash }: { isRecoiling: boolean; muzzleFlash: boolean }) {
  return (
    <>
      {/* Main body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.18, 0.7]} />
        <meshStandardMaterial color="#2a2020" roughness={0.7} metalness={0.4} />
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

      {/* Red energy core */}
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

      {/* Muzzle flash */}
      {muzzleFlash && (
        <mesh position={[0, 0.03, -0.7]}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={0.8} />
        </mesh>
      )}

      <pointLight color="#ff0000" intensity={0.5} distance={2} position={[0, 0.05, -0.15]} />
    </>
  );
}

// Steve's Nail Bat model
function NailBatModel({ isSwinging }: { isSwinging: boolean }) {
  return (
    <>
      {/* Bat handle */}
      <mesh position={[0, -0.1, 0.2]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.04, 0.03, 0.4]} />
        <meshStandardMaterial color="#4a3520" roughness={0.9} />
      </mesh>
      
      {/* Bat body */}
      <mesh position={[0, 0.15, -0.1]} rotation={[Math.PI / 2 - 0.3, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.8]} />
        <meshStandardMaterial color="#5c4030" roughness={0.8} />
      </mesh>
      
      {/* Nails */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * 0.08,
              0.25 + (i % 3) * 0.1,
              -0.2 + Math.sin(angle) * 0.08
            ]}
            rotation={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]}
          >
            <coneGeometry args={[0.01, 0.08, 4]} />
            <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Blood stains */}
      <mesh position={[0.05, 0.2, -0.15]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#440000" transparent opacity={0.7} />
      </mesh>
    </>
  );
}

// Flamethrower model
function FlamethrowerModel({ isFiring, ammo }: { isFiring: boolean; ammo: number }) {
  return (
    <>
      {/* Main tank */}
      <mesh position={[0, 0, 0.1]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#2a3530" roughness={0.6} metalness={0.4} />
      </mesh>
      
      {/* Fuel gauge */}
      <mesh position={[0.12, 0, 0.1]}>
        <boxGeometry args={[0.02, 0.15, 0.04]} />
        <meshBasicMaterial color={ammo > 30 ? "#00ff00" : ammo > 10 ? "#ffff00" : "#ff0000"} />
      </mesh>
      
      {/* Barrel */}
      <mesh position={[0, 0.05, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.6]} />
        <meshStandardMaterial color="#1a2520" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Grip */}
      <mesh position={[0, -0.15, 0.15]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.08, 0.18, 0.1]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
      
      {/* Pilot light */}
      <mesh position={[0, 0.06, -0.7]}>
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>

      {/* Flame effect when firing */}
      {isFiring && ammo > 0 && (
        <>
          <mesh position={[0, 0.05, -0.9]}>
            <coneGeometry args={[0.15, 0.5, 8]} />
            <meshBasicMaterial color="#ff4400" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.05, -1.2]}>
            <coneGeometry args={[0.25, 0.6, 8]} />
            <meshBasicMaterial color="#ff8800" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0.05, -1.5]}>
            <coneGeometry args={[0.35, 0.5, 8]} />
            <meshBasicMaterial color="#ffaa00" transparent opacity={0.5} />
          </mesh>
          <pointLight color="#ff6600" intensity={3} distance={10} position={[0, 0, -1]} />
        </>
      )}

      <pointLight color="#ff6600" intensity={0.3} distance={1} position={[0, 0.06, -0.7]} />
    </>
  );
}

export function Weapon() {
  const { camera, scene } = useThree();
  const weaponRef = useRef<Group>(null);
  const raycaster = useRef(new Raycaster());
  const damageEnemy = useGameStore(state => state.damageEnemy);
  const damageBoss = useGameStore(state => state.damageBoss);
  const recordShot = useGameStore(state => state.recordShot);
  const isPlaying = useGameStore(state => state.isPlaying);
  const showLevelIntro = useGameStore(state => state.showLevelIntro);
  const showLevelComplete = useGameStore(state => state.showLevelComplete);
  const currentWeapon = useGameStore(state => state.currentWeapon);
  const switchWeapon = useGameStore(state => state.switchWeapon);
  const unlockedWeapons = useGameStore(state => state.unlockedWeapons);
  const flamethrowerAmmo = useGameStore(state => state.flamethrowerAmmo);
  const useFlamethrowerAmmo = useGameStore(state => state.useFlamethrowerAmmo);
  
  const [isRecoiling, setIsRecoiling] = useState(false);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [isSwinging, setIsSwinging] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const lastFireTime = useRef(0);

  // Weapon switching with number keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      if (e.key === '1' && unlockedWeapons.includes('pistol')) {
        switchWeapon('pistol');
      } else if (e.key === '2' && unlockedWeapons.includes('nailbat')) {
        switchWeapon('nailbat');
      } else if (e.key === '3' && unlockedWeapons.includes('flamethrower')) {
        switchWeapon('flamethrower');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, unlockedWeapons, switchWeapon]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isPlaying || showLevelIntro || showLevelComplete || document.pointerLockElement !== document.body) return;
      
      if (e.button === 0) {
        attack();
      }
    };

    const handleMouseUp = () => {
      setIsFiring(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPlaying, showLevelIntro, showLevelComplete, currentWeapon, attack]);

  // Continuous flamethrower firing
  useFrame(() => {
    if (weaponRef.current) {
      weaponRef.current.position.copy(camera.position);
      weaponRef.current.rotation.copy(camera.rotation);
      weaponRef.current.translateX(0.4);
      weaponRef.current.translateY(-0.3 + (isRecoiling ? 0.05 : 0) + (isSwinging ? 0.1 : 0));
      weaponRef.current.translateZ(-0.5 + (isRecoiling ? 0.1 : 0));
      
      // Swing animation for nail bat
      if (isSwinging) {
        weaponRef.current.rotation.z += 0.3;
      }
    }

    // Continuous flamethrower damage
    if (isFiring && currentWeapon === 'flamethrower' && flamethrowerAmmo > 0) {
      const now = Date.now();
      if (now - lastFireTime.current >= WEAPON_STATS.flamethrower.fireRate) {
        lastFireTime.current = now;
        useFlamethrowerAmmo(1);
        flamethrowerAttack();
      }
    }
  });

  const attack = () => {
    const weaponStats = WEAPON_STATS[currentWeapon];
    const now = Date.now();
    
    if (now - lastFireTime.current < weaponStats.fireRate) return;
    lastFireTime.current = now;

    switch (currentWeapon) {
      case 'pistol':
        pistolShoot();
        break;
      case 'nailbat':
        nailbatSwing();
        break;
      case 'flamethrower':
        setIsFiring(true);
        break;
    }
  };

  const pistolShoot = () => {
    setIsRecoiling(true);
    setMuzzleFlash(true);
    setTimeout(() => setIsRecoiling(false), 100);
    setTimeout(() => setMuzzleFlash(false), 50);
    
    raycaster.current.setFromCamera(new Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      let obj: Object3D | null = hit.object;
      while (obj) {
        if (obj.userData?.isBoss) {
          damageBoss(WEAPON_STATS.pistol.damage);
          recordShot(true);
          return;
        }
        if (obj.userData?.isEnemy) {
          damageEnemy(obj.userData.id, 1);
          recordShot(true);
          return;
        }
        obj = obj.parent;
      }
    }
    recordShot(false);
  };

  const nailbatSwing = () => {
    setIsSwinging(true);
    setTimeout(() => setIsSwinging(false), 300);
    
    // Melee range check
    raycaster.current.setFromCamera(new Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      if (hit.distance > WEAPON_STATS.nailbat.range) continue;
      
      let obj: Object3D | null = hit.object;
      while (obj) {
        if (obj.userData?.isBoss) {
          damageBoss(WEAPON_STATS.nailbat.damage);
          recordShot(true);
          return;
        }
        if (obj.userData?.isEnemy) {
          damageEnemy(obj.userData.id, 3); // Nail bat does more damage
          recordShot(true);
          return;
        }
        obj = obj.parent;
      }
    }
    recordShot(false);
  };

  const flamethrowerAttack = () => {
    raycaster.current.setFromCamera(new Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const hit of intersects) {
      if (hit.distance > WEAPON_STATS.flamethrower.range) continue;
      
      let obj: Object3D | null = hit.object;
      while (obj) {
        if (obj.userData?.isBoss) {
          damageBoss(WEAPON_STATS.flamethrower.damage);
          recordShot(true);
          return;
        }
        if (obj.userData?.isEnemy) {
          damageEnemy(obj.userData.id, 1);
          recordShot(true);
          return;
        }
        obj = obj.parent;
      }
    }
  };

  return (
    <group ref={weaponRef}>
      {currentWeapon === 'pistol' && <PistolModel isRecoiling={isRecoiling} muzzleFlash={muzzleFlash} />}
      {currentWeapon === 'nailbat' && <NailBatModel isSwinging={isSwinging} />}
      {currentWeapon === 'flamethrower' && <FlamethrowerModel isFiring={isFiring} ammo={flamethrowerAmmo} />}
    </group>
  );
}
