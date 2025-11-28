import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Cylinder, Plane, Sphere, useTexture } from "@react-three/drei";

interface PickableFrameProps {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  imageUrl: string;
}

export const PickableFrame = ({ 
  id,
  position, 
  rotation = [0, 0, 0],
  scale = 0.7,
  imageUrl
}: PickableFrameProps) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const [isHeld, setIsHeld] = useState(false);
  const [texture] = useTexture([imageUrl]);
  const frameCountRef = useRef(0);
  const originalPosition = useRef<[number, number, number]>(position);
  const originalRotation = useRef<[number, number, number]>(rotation);
  const [dimensions, setDimensions] = useState({
    photoWidth: 0.22,
    photoHeight: 0.32,
    outerFrameWidth: 0.32,
    outerFrameHeight: 0.42,
    midFrameWidth: 0.295,
    midFrameHeight: 0.395,
    innerFrameWidth: 0.27,
    innerFrameHeight: 0.37,
    glassWidth: 0.26,
    glassHeight: 0.36
  });

  // Calculate frame dimensions when texture is loaded
  useEffect(() => {
    if (texture && texture.image) {
      const imageWidth = texture.image.width || 1;
      const imageHeight = texture.image.height || 1;
      const aspectRatio = imageWidth / imageHeight;
      
      // Compress texture for better performance
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      
      console.log(`Frame ${id} - Image loaded: ${imageWidth}x${imageHeight}, aspect: ${aspectRatio.toFixed(2)}`);
      
      // Base dimensions - adjust frame to match image proportions
      const maxDimension = 0.35;
      let photoWidth: number;
      let photoHeight: number;
      
      if (aspectRatio > 1.2) {
        // Landscape image (wider than tall)
        photoWidth = maxDimension;
        photoHeight = maxDimension / aspectRatio;
      } else if (aspectRatio < 0.8) {
        // Portrait image (taller than wide)
        photoHeight = maxDimension;
        photoWidth = maxDimension * aspectRatio;
      } else {
        // Nearly square image
        const avgDimension = maxDimension * 0.9;
        if (aspectRatio >= 1) {
          photoWidth = avgDimension;
          photoHeight = avgDimension / aspectRatio;
        } else {
          photoHeight = avgDimension;
          photoWidth = avgDimension * aspectRatio;
        }
      }
      
      // Frame dimensions (add padding around photo)
      const framePadding = 0.05;
      
      setDimensions({
        photoWidth,
        photoHeight,
        outerFrameWidth: photoWidth + framePadding * 2,
        outerFrameHeight: photoHeight + framePadding * 2,
        midFrameWidth: photoWidth + framePadding * 1.5,
        midFrameHeight: photoHeight + framePadding * 1.5,
        innerFrameWidth: photoWidth + framePadding,
        innerFrameHeight: photoHeight + framePadding,
        glassWidth: photoWidth + framePadding * 0.8,
        glassHeight: photoHeight + framePadding * 0.8
      });
    }
  }, [texture, id]);

  // Set initial position and rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      console.log(`Frame ${id} initialized at position:`, position);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handlePickUpToggle = (e: CustomEvent) => {
      console.log(`PickableFrame ${id} received toggle event. Event objectId:`, e.detail?.objectId);
      if (e.detail?.objectId === id && groupRef.current) {
        const newHeldState = !isHeld;
        console.log(`✅ Frame ${id} held state changed:`, newHeldState);
        setIsHeld(newHeldState);
        
        // Notify about pickup state
        const pickupEvent = new CustomEvent('objectPickupChanged', {
          detail: { objectId: id, isHeld: newHeldState, type: 'frame' }
        });
        window.dispatchEvent(pickupEvent);
      }
    };

    const handleDrop = () => {
      if (isHeld) {
        console.log(`Dropping frame ${id}`);
        setIsHeld(false);
        
        const pickupEvent = new CustomEvent('objectPickupChanged', {
          detail: { objectId: id, isHeld: false, type: 'frame' }
        });
        window.dispatchEvent(pickupEvent);
      }
    };

    window.addEventListener('toggleObjectPickup', handlePickUpToggle as EventListener);
    window.addEventListener('dropObject', handleDrop);
    
    return () => {
      window.removeEventListener('toggleObjectPickup', handlePickUpToggle as EventListener);
      window.removeEventListener('dropObject', handleDrop);
    };
  }, [isHeld, id]);

  useFrame(() => {
    // Debug log every 60 frames
    if (frameCountRef.current % 60 === 0 && isHeld) {
      console.log(`Frame ${id} is being held, following camera`);
    }
    frameCountRef.current++;
    
    if (groupRef.current) {
      if (isHeld) {
        // Follow camera when held - centered in front of player to show the picture, slightly higher
        const offset = new THREE.Vector3(0, 0.05, -0.5);
        offset.applyQuaternion(camera.quaternion);
        
        groupRef.current.position.copy(camera.position).add(offset);
        groupRef.current.rotation.copy(camera.rotation);
      } else {
        // Stay at original position when not held
        groupRef.current.position.set(
          originalPosition.current[0], 
          originalPosition.current[1], 
          originalPosition.current[2]
        );
        groupRef.current.rotation.set(
          originalRotation.current[0], 
          originalRotation.current[1], 
          originalRotation.current[2]
        );
      }
    }
  });

  // Calculate corner positions based on dynamic frame size
  const cornerX = dimensions.outerFrameWidth / 2 - 0.02;
  const cornerY = dimensions.outerFrameHeight / 2 - 0.02;
  
  return (
    <group 
      ref={groupRef}
      name={`pickable-frame-${id}`}
      scale={scale}
    >
      {/* Ornate outer frame - antique gold */}
      <Box args={[dimensions.outerFrameWidth, dimensions.outerFrameHeight, 0.04]} castShadow>
        <meshStandardMaterial 
          color="#b8860b" 
          metalness={0.7}
          roughness={0.4}
          emissive="#7a5a1f"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Decorative embossed border */}
      <Box args={[dimensions.midFrameWidth, dimensions.midFrameHeight, 0.03]} position={[0, 0, 0.035]}>
        <meshStandardMaterial 
          color="#8b7355" 
          metalness={0.5}
          roughness={0.6}
        />
      </Box>
      
      {/* Inner Victorian frame */}
      <Box args={[dimensions.innerFrameWidth, dimensions.innerFrameHeight, 0.02]} position={[0, 0, 0.05]}>
        <meshStandardMaterial 
          color="#cd7f32" 
          metalness={0.8}
          roughness={0.3}
        />
      </Box>
      
      {/* Photo with aged effect - maintains original aspect ratio */}
      <Plane args={[dimensions.photoWidth, dimensions.photoHeight]} position={[0, 0, 0.065]}>
        <meshStandardMaterial 
          map={texture}
          roughness={0.8}
        />
      </Plane>
      
      {/* Aged glass with patina */}
      <Plane args={[dimensions.glassWidth, dimensions.glassHeight]} position={[0, 0, 0.07]}>
        <meshStandardMaterial 
          transparent
          opacity={0.15}
          color="#f5f5dc"
          metalness={0.3}
          roughness={0.7}
        />
      </Plane>
      
      {/* Victorian ornamental corners */}
      {[[-cornerX, cornerY], [cornerX, cornerY], [-cornerX, -cornerY], [cornerX, -cornerY]].map((pos, i) => (
        <group key={`ornament-${i}`} position={[pos[0], pos[1], 0.04]}>
          <Box args={[0.025, 0.025, 0.015]} castShadow>
            <meshStandardMaterial 
              color="#daa520" 
              metalness={0.9}
              roughness={0.2}
            />
          </Box>
          <Sphere args={[0.012, 8, 8]} position={[0, 0, 0.01]}>
            <meshStandardMaterial 
              color="#ffd700" 
              metalness={1}
              roughness={0.1}
            />
          </Sphere>
        </group>
      ))}
      
      {/* Top decorative crown */}
      <Box args={[0.08, 0.03, 0.02]} position={[0, dimensions.outerFrameHeight / 2 + 0.01, 0.02]} castShadow>
        <meshStandardMaterial 
          color="#b8860b" 
          metalness={0.8}
          roughness={0.3}
        />
      </Box>
      
      {/* Ornate Victorian base/stand */}
      <group position={[0, -dimensions.outerFrameHeight / 2 - 0.03, -0.03]}>
        <Cylinder args={[0.04, 0.05, 0.02, 8]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#8b7355" 
            metalness={0.6}
            roughness={0.5}
          />
        </Cylinder>
        <Box args={[0.12, 0.015, 0.12]} position={[0, -0.015, 0]}>
          <meshStandardMaterial 
            color="#654321" 
            metalness={0.4}
            roughness={0.7}
          />
        </Box>
      </group>
    </group>
  );
};

