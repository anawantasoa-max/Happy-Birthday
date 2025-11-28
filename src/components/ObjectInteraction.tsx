import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ObjectInteraction = () => {
  const { camera, scene, raycaster } = useThree();
  const centerPointer = new THREE.Vector2(0, 0); // Center of screen
  const [hoveredObject, setHoveredObject] = useState<{id: string, type: string} | null>(null);
  const pickableObjectsRef = useRef<Map<string, THREE.Group>>(new Map());
  const currentlyHeldObjectRef = useRef<string | null>(null);

  useEffect(() => {
    const handleClick = () => {
      if (!hoveredObject) {
        console.log('No object is being hovered');
        return;
      }

      const object = pickableObjectsRef.current.get(hoveredObject.id);
      if (!object) {
        console.log('Object reference not found:', hoveredObject.id);
        return;
      }

      // Use center of screen for raycasting
      raycaster.setFromCamera(centerPointer, camera);
      
      // Check intersection
      const intersects = raycaster.intersectObjects(object.children, true);
      
      console.log('Click detected on', hoveredObject.type, 'Intersects:', intersects.length);
      
      if (intersects.length > 0 && intersects[0].distance < 5) {
        // Extract actual ID for frames
        const objectId = hoveredObject.type === 'frame' ? 
          hoveredObject.id.replace('pickable-frame-', '') : 
          hoveredObject.id;
        
        console.log('Picking up object:', objectId, 'Full name:', hoveredObject.id);
        
        // If currently holding something else, drop it first
        if (currentlyHeldObjectRef.current && currentlyHeldObjectRef.current !== objectId) {
          console.log('Dropping current object:', currentlyHeldObjectRef.current, 'to pick up:', objectId);
          
          // Drop the currently held object
          const dropEvent = new Event('dropObject');
          window.dispatchEvent(dropEvent);
          
          const bouquetDropEvent = new Event('dropBouquet');
          window.dispatchEvent(bouquetDropEvent);
          
          // Wait a tiny bit for the drop to process
          setTimeout(() => {
            // Now pick up the new object
            const event = new CustomEvent('toggleObjectPickup', {
              detail: { objectId: objectId }
            });
            window.dispatchEvent(event);
            
            // For bouquet, keep old event for backward compatibility
            if (hoveredObject.type === 'bouquet') {
              const bouquetEvent = new CustomEvent('toggleBouquetPickup', {
                detail: { bouquetRef: object }
              });
              window.dispatchEvent(bouquetEvent);
            }
            
            currentlyHeldObjectRef.current = objectId;
          }, 50);
        } else {
          // Toggle pickup (pick up or drop)
          const event = new CustomEvent('toggleObjectPickup', {
            detail: { objectId: objectId }
          });
          window.dispatchEvent(event);
          
          // For bouquet, keep old event for backward compatibility
          if (hoveredObject.type === 'bouquet') {
            const bouquetEvent = new CustomEvent('toggleBouquetPickup', {
              detail: { bouquetRef: object }
            });
            window.dispatchEvent(bouquetEvent);
          }
          
          // Update currently held object
          if (currentlyHeldObjectRef.current === objectId) {
            currentlyHeldObjectRef.current = null;
          } else {
            currentlyHeldObjectRef.current = objectId;
          }
        }
      }
    };

    const handleDrop = (e: KeyboardEvent) => {
      // Press G to drop any held object
      if (e.key.toLowerCase() === 'g') {
        console.log('Drop key pressed');
        const event = new Event('dropObject');
        window.dispatchEvent(event);
        
        // For bouquet, keep old event for backward compatibility
        const bouquetEvent = new Event('dropBouquet');
        window.dispatchEvent(bouquetEvent);
        
        // Clear the currently held object reference
        currentlyHeldObjectRef.current = null;
      }
    };

    // Listen for pickup state changes to update the reference
    const handlePickupChange = (e: CustomEvent) => {
      if (e.detail?.isHeld) {
        currentlyHeldObjectRef.current = e.detail.objectId;
        console.log('Object picked up, tracking:', e.detail.objectId);
      } else {
        currentlyHeldObjectRef.current = null;
        console.log('Object dropped');
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleDrop);
    window.addEventListener('objectPickupChanged', handlePickupChange as EventListener);
    window.addEventListener('bouquetPickupChanged', handlePickupChange as EventListener);
    
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleDrop);
      window.removeEventListener('objectPickupChanged', handlePickupChange as EventListener);
      window.removeEventListener('bouquetPickupChanged', handlePickupChange as EventListener);
    };
  }, [hoveredObject, camera, raycaster, centerPointer]);

  useFrame(() => {
    // Find all pickable objects in the scene
    pickableObjectsRef.current.clear();
    
    scene.traverse((object) => {
      if (object.name.startsWith('pickable-frame-')) {
        const fullName = object.name;
        if (object instanceof THREE.Group) {
          pickableObjectsRef.current.set(fullName, object);
        }
      } else if (object.name === 'flower-bouquet' && object instanceof THREE.Group) {
        pickableObjectsRef.current.set('flower-bouquet', object);
      }
    });

    // Check if looking at any pickable object
    raycaster.setFromCamera(centerPointer, camera);
    let foundHoveredObject = false;

    for (const [fullName, object] of pickableObjectsRef.current.entries()) {
      const intersects = raycaster.intersectObjects(object.children, true);
      const isLookingAtObject = intersects.length > 0 && intersects[0].distance < 5;
      
      if (isLookingAtObject) {
        const type = fullName === 'flower-bouquet' ? 'bouquet' : 'frame';
        // Extract actual ID for frames (e.g., "frame-1" from "pickable-frame-frame-1")
        const objectId = type === 'frame' ? fullName.replace('pickable-frame-', '') : fullName;
        
        if (!hoveredObject || hoveredObject.id !== fullName) {
          setHoveredObject({ id: fullName, type });
          
          console.log('Hovering over object:', fullName, 'Type:', type, 'ID:', objectId);
          
          // Notify about hover state
          const event = new CustomEvent('objectHoverChanged', {
            detail: { isHovering: true, objectId: objectId, type }
          });
          window.dispatchEvent(event);
          
          // For bouquet, keep old event for backward compatibility
          if (type === 'bouquet') {
            const bouquetEvent = new CustomEvent('bouquetHoverChanged', {
              detail: { isHovering: true }
            });
            window.dispatchEvent(bouquetEvent);
          }
        }
        
        foundHoveredObject = true;
        break;
      }
    }

    if (!foundHoveredObject && hoveredObject) {
      setHoveredObject(null);
      
      // Notify about hover end
      const event = new CustomEvent('objectHoverChanged', {
        detail: { isHovering: false, objectId: null, type: null }
      });
      window.dispatchEvent(event);
      
      // For bouquet, keep old event for backward compatibility
      const bouquetEvent = new CustomEvent('bouquetHoverChanged', {
        detail: { isHovering: false }
      });
      window.dispatchEvent(bouquetEvent);
    }
  });

  return null;
};

