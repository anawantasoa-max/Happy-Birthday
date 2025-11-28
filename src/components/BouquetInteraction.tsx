import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const BouquetInteraction = () => {
  const { camera, scene, raycaster } = useThree();
  const bouquetRef = useRef<THREE.Group | null>(null);
  const centerPointer = new THREE.Vector2(0, 0); // Center of screen
  const [isHoveringBouquet, setIsHoveringBouquet] = useState(false);

  useEffect(() => {
    // Find the bouquet in the scene by name
    const findBouquet = () => {
      scene.traverse((object) => {
        if (object.name === 'flower-bouquet' && object instanceof THREE.Group) {
          bouquetRef.current = object;
          console.log('Found flower bouquet!', object);
        }
      });
    };

    // Try to find it immediately
    findBouquet();
    
    // Also try after a delay to ensure model is loaded
    const timer = setTimeout(findBouquet, 500);
    return () => clearTimeout(timer);
  }, [scene]);

  useEffect(() => {
    const handleClick = () => {
      if (!bouquetRef.current) {
        console.log('Bouquet reference not found!');
        return;
      }

      // Use center of screen for raycasting
      raycaster.setFromCamera(centerPointer, camera);
      
      // Check intersection with bouquet
      const intersects = raycaster.intersectObjects(bouquetRef.current.children, true);
      
      console.log('Click detected. Intersects:', intersects.length, 'Distance:', intersects.length > 0 ? intersects[0].distance : 'N/A');
      
      if (intersects.length > 0 && intersects[0].distance < 5) {
        console.log('Picking up bouquet!');
        // Toggle pickup
        const event = new CustomEvent('toggleBouquetPickup', {
          detail: { bouquetRef: bouquetRef.current }
        });
        window.dispatchEvent(event);
      }
    };

    const handleDrop = (e: KeyboardEvent) => {
      // Press G to drop the bouquet
      if (e.key.toLowerCase() === 'g') {
        const event = new Event('dropBouquet');
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleDrop);
    
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleDrop);
    };
  }, [camera, raycaster, centerPointer]);

  useFrame(() => {
    // Update bouquet reference if needed
    if (!bouquetRef.current) {
      scene.traverse((object) => {
        if (object.name === 'flower-bouquet' && object instanceof THREE.Group) {
          bouquetRef.current = object;
        }
      });
    }

    // Check if looking at bouquet
    if (bouquetRef.current) {
      raycaster.setFromCamera(centerPointer, camera);
      const intersects = raycaster.intersectObjects(bouquetRef.current.children, true);
      
      // Increased distance to 5 units for better detection
      const isLookingAtBouquet = intersects.length > 0 && intersects[0].distance < 5;
      
      if (isLookingAtBouquet !== isHoveringBouquet) {
        setIsHoveringBouquet(isLookingAtBouquet);
        
        // Notify about crosshair visibility
        const event = new CustomEvent('bouquetHoverChanged', {
          detail: { isHovering: isLookingAtBouquet }
        });
        window.dispatchEvent(event);
      }
    }
  });

  return null;
};

