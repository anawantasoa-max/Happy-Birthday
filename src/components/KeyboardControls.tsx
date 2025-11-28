import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

interface KeyboardControlsProps {
  onDistanceChange?: (distance: number) => void;
  isModalOpen?: boolean;
}

export const KeyboardControls = ({ onDistanceChange, isModalOpen = false }: KeyboardControlsProps) => {
  const { camera } = useThree();
  const moveSpeed = 0.12;
  const velocity = useRef(new Vector3());
  const smoothness = 0.15;
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  
  // Cake position
  const cakePosition = new Vector3(0, 1.05, -3);
  
  // Optimal camera position for viewing blowing animation - further back and higher
  const optimalPosition = new Vector3(0, 2.5, 0.5);
  const isPositioningRef = useRef(false);

  // Position camera optimally when wish modal opens
  useEffect(() => {
    const handlePositionCamera = () => {
      console.log('📍 Positioning camera for wish animation...');
      isPositioningRef.current = true;
    };

    window.addEventListener('positionCameraForWish', handlePositionCamera);
    return () => window.removeEventListener('positionCameraForWish', handlePositionCamera);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code;
      
      // Map Arabic keys to English equivalents based on physical key position
      let normalizedKey = key;
      
      // Arabic keyboard mappings for WASD
      if (key === 'ص' || code === 'KeyW') normalizedKey = 'w';
      if (key === 'ش' || code === 'KeyA') normalizedKey = 'a';
      if (key === 'س' || code === 'KeyS') normalizedKey = 's';
      if (key === 'ي' || code === 'KeyD') normalizedKey = 'd';
      
      // Arrow keys work with any keyboard
      if (code === 'ArrowUp') normalizedKey = 'arrowup';
      if (code === 'ArrowDown') normalizedKey = 'arrowdown';
      if (code === 'ArrowLeft') normalizedKey = 'arrowleft';
      if (code === 'ArrowRight') normalizedKey = 'arrowright';
      
      keysPressed.current[normalizedKey] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const code = e.code;
      
      // Map Arabic keys to English equivalents
      let normalizedKey = key;
      
      if (key === 'ص' || code === 'KeyW') normalizedKey = 'w';
      if (key === 'ش' || code === 'KeyA') normalizedKey = 'a';
      if (key === 'س' || code === 'KeyS') normalizedKey = 's';
      if (key === 'ي' || code === 'KeyD') normalizedKey = 'd';
      
      if (code === 'ArrowUp') normalizedKey = 'arrowup';
      if (code === 'ArrowDown') normalizedKey = 'arrowdown';
      if (code === 'ArrowLeft') normalizedKey = 'arrowleft';
      if (code === 'ArrowRight') normalizedKey = 'arrowright';
      
      keysPressed.current[normalizedKey] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame(() => {
    // If positioning camera for wish animation
    if (isPositioningRef.current) {
      const currentPos = camera.position;
      const targetPos = optimalPosition;
      
      // Very smooth interpolation to target position
      currentPos.lerp(targetPos, 0.05);
      
      // Look at the cake smoothly
      camera.lookAt(cakePosition);
      
      // Stop positioning when close enough
      if (currentPos.distanceTo(targetPos) < 0.05) {
        isPositioningRef.current = false;
        camera.position.copy(targetPos); // Snap to exact position
        camera.lookAt(cakePosition);
        console.log('✅ Camera positioned optimally!');
      }
      return; // Don't process normal movement
    }

    // Don't allow movement when modal is open
    if (isModalOpen) {
      velocity.current.set(0, 0, 0);
      return;
    }

    const moveForward = 
      (keysPressed.current["w"] || keysPressed.current["arrowup"]) ? 1 : 0;
    const moveBackward = 
      (keysPressed.current["s"] || keysPressed.current["arrowdown"]) ? 1 : 0;
    const moveLeft = 
      (keysPressed.current["a"] || keysPressed.current["arrowleft"]) ? 1 : 0;
    const moveRight = 
      (keysPressed.current["d"] || keysPressed.current["arrowright"]) ? 1 : 0;

    const forwardDir = moveForward - moveBackward;
    const rightDir = moveRight - moveLeft;

    // Get camera direction
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0; // Keep movement horizontal
    direction.normalize();

    // Get right vector
    const right = new Vector3();
    right.crossVectors(camera.up, direction).normalize();

    // Calculate target velocity
    const targetVelocity = new Vector3();
    targetVelocity.addScaledVector(direction, forwardDir * moveSpeed);
    targetVelocity.addScaledVector(right, -rightDir * moveSpeed);

    // Smooth interpolation
    velocity.current.lerp(targetVelocity, smoothness);

    // Apply movement if there's velocity
    if (velocity.current.length() > 0.001) {
      const newPosition = camera.position.clone().add(velocity.current);
      
      // Set boundaries to keep player inside the room
      const boundaryX = 9;
      const boundaryZ = 9;
      
      newPosition.x = Math.max(-boundaryX, Math.min(boundaryX, newPosition.x));
      newPosition.z = Math.max(-boundaryZ, Math.min(boundaryZ, newPosition.z));
      newPosition.y = 2.2; // Keep at new eye level
      
      // Table collision detection with smooth boundaries
      const tableMinX = -1.7;
      const tableMaxX = 1.7;
      const tableMinZ = -4.2;
      const tableMaxZ = -1.8;
      const safeDistance = 0.4; // Safe distance from table
      
      // Check if player is inside or too close to table
      const distToLeftEdge = newPosition.x - (tableMinX - safeDistance);
      const distToRightEdge = (tableMaxX + safeDistance) - newPosition.x;
      const distToBackEdge = newPosition.z - (tableMinZ - safeDistance);
      const distToFrontEdge = (tableMaxZ + safeDistance) - newPosition.z;
      
      // If inside table zone, push out smoothly
      if (distToLeftEdge > 0 && distToRightEdge > 0 && 
          distToBackEdge > 0 && distToFrontEdge > 0) {
        
        // Find nearest edge to push player out
        const minDist = Math.min(distToLeftEdge, distToRightEdge, distToBackEdge, distToFrontEdge);
        
        if (minDist === distToLeftEdge) {
          // Push to left
          newPosition.x = tableMinX - safeDistance - 0.1;
        } else if (minDist === distToRightEdge) {
          // Push to right
          newPosition.x = tableMaxX + safeDistance + 0.1;
        } else if (minDist === distToBackEdge) {
          // Push to back
          newPosition.z = tableMinZ - safeDistance - 0.1;
        } else {
          // Push to front
          newPosition.z = tableMaxZ + safeDistance + 0.1;
        }
      }

      camera.position.copy(newPosition);
    }
    
    // Calculate distance to cake and notify
    const distanceToCake = camera.position.distanceTo(cakePosition);
    if (onDistanceChange) {
      onDistanceChange(distanceToCake);
    }
  });

  return null;
};

