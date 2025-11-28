import { useGLTF } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FlowerBouquetProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onPickUp?: (isHeld: boolean) => void;
}

export const FlowerBouquet = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  onPickUp
}: FlowerBouquetProps) => {
  const { scene } = useGLTF('/flower_bouquet.glb');
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [isHeld, setIsHeld] = useState(false);
  
  // Clone the scene to avoid sharing the same instance
  const clonedScene = scene.clone();
  
  useEffect(() => {
    // Enable shadows and make meshes interactable
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    const handlePickUpToggle = (e: CustomEvent) => {
      console.log('Toggle pickup event received', e.detail, groupRef.current);
      // Support both old bouquetRef and new objectId
      const isThisBouquet = e.detail?.bouquetRef === groupRef.current || 
                            e.detail?.objectId === 'flower-bouquet';
      
      if (isThisBouquet) {
        const newHeldState = !isHeld;
        console.log('Bouquet held state changed:', newHeldState);
        setIsHeld(newHeldState);
        
        // Notify Room3D about pickup state (both events for compatibility)
        const pickupEvent = new CustomEvent('bouquetPickupChanged', {
          detail: { isHeld: newHeldState, objectId: 'flower-bouquet' }
        });
        window.dispatchEvent(pickupEvent);
        
        const objectPickupEvent = new CustomEvent('objectPickupChanged', {
          detail: { objectId: 'flower-bouquet', isHeld: newHeldState, type: 'bouquet' }
        });
        window.dispatchEvent(objectPickupEvent);
        
        if (onPickUp) {
          onPickUp(newHeldState);
        }
      }
    };

    const handleDrop = () => {
      console.log('Drop event received. Currently held:', isHeld);
      if (isHeld) {
        console.log('Dropping bouquet');
        setIsHeld(false);
        
        // Notify Room3D about drop (both events for compatibility)
        const pickupEvent = new CustomEvent('bouquetPickupChanged', {
          detail: { isHeld: false, objectId: 'flower-bouquet' }
        });
        window.dispatchEvent(pickupEvent);
        
        const objectPickupEvent = new CustomEvent('objectPickupChanged', {
          detail: { objectId: 'flower-bouquet', isHeld: false, type: 'bouquet' }
        });
        window.dispatchEvent(objectPickupEvent);
        
        if (onPickUp) {
          onPickUp(false);
        }
      }
    };

    window.addEventListener('toggleBouquetPickup', handlePickUpToggle as EventListener);
    window.addEventListener('toggleObjectPickup', handlePickUpToggle as EventListener);
    window.addEventListener('dropBouquet', handleDrop);
    window.addEventListener('dropObject', handleDrop);
    
    return () => {
      window.removeEventListener('toggleBouquetPickup', handlePickUpToggle as EventListener);
      window.removeEventListener('toggleObjectPickup', handlePickUpToggle as EventListener);
      window.removeEventListener('dropBouquet', handleDrop);
      window.removeEventListener('dropObject', handleDrop);
    };
  }, [isHeld, onPickUp]);

  const frameCountRef = useRef(0);
  
  useFrame(() => {
    // Debug log every 60 frames (once per second at 60fps)
    if (frameCountRef.current % 60 === 0 && isHeld) {
      console.log('Bouquet is being held, following camera');
    }
    frameCountRef.current++;
    
    if (isHeld && groupRef.current) {
      // Follow camera when held - in front of player, lower position
      const offset = new THREE.Vector3(0.2, -0.7, -0.7);
      offset.applyQuaternion(camera.quaternion);
      
      groupRef.current.position.copy(camera.position).add(offset);
      groupRef.current.rotation.copy(camera.rotation);
    } else if (groupRef.current && !isHeld) {
      // When not held, ensure it stays at the original position
      // This prevents it from floating away
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  });

  return (
    <group 
      ref={groupRef}
      name="flower-bouquet"
      position={position}
      rotation={rotation}
    >
      <primitive 
        object={clonedScene} 
        scale={scale}
        castShadow
        receiveShadow
      />
    </group>
  );
};

// Preload the model
useGLTF.preload('/flower_bouquet.glb');

