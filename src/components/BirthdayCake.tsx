import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Cylinder, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface FlameGroup {
  outer: THREE.Mesh | null;
  inner: THREE.Mesh | null;
  core: THREE.Mesh | null;
  light: THREE.PointLight | null;
  smoke: THREE.Mesh[];
  sparks: THREE.Mesh[];
}

interface BirthdayCakeProps {
  onBlowCandles?: () => void;
}

export const BirthdayCake = ({ onBlowCandles }: BirthdayCakeProps) => {
  const flameGroups = useRef<FlameGroup[]>([]);
  const heartRefs = useRef<THREE.Group[]>([]);
  const [candlesLit, setCandlesLit] = useState(true);
  const blowingRef = useRef(false);
  const blowProgressRef = useRef(0);
  
  // Listen for blow event
  useEffect(() => {
    const handleBlow = () => {
      if (!blowingRef.current) {
        blowingRef.current = true;
        blowProgressRef.current = 0;
      }
    };
    
    window.addEventListener('blowCandles', handleBlow);
    return () => window.removeEventListener('blowCandles', handleBlow);
  }, []);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Handle blowing animation
    if (blowingRef.current) {
      blowProgressRef.current += 0.02;
      
      if (blowProgressRef.current >= 1) {
        blowingRef.current = false;
        setCandlesLit(false);
        if (onBlowCandles) {
          onBlowCandles();
        }
      }
    }
    
    // Animate candle flames with realistic fire movement
    flameGroups.current.forEach((group, i) => {
      if (!group) return;
      
      // Flames extinguish during blow animation
      const blowEffect = blowingRef.current ? (1 - blowProgressRef.current) : 1;
      const flickerIntensity = candlesLit ? blowEffect : 0;
      
      const offset = i * 1.234; // Different offset for each candle
      
      // Realistic flicker patterns
      const flicker1 = Math.sin(time * 12 + offset) * 0.15;
      const flicker2 = Math.cos(time * 8 + offset * 1.5) * 0.1;
      const flicker3 = Math.sin(time * 20 + offset * 2) * 0.05;
      const mainFlicker = flicker1 + flicker2 + flicker3;
      
      // Animate outer flame (shape and movement)
      if (group.outer) {
        const outerMaterial = group.outer.material as THREE.MeshStandardMaterial;
        
        // Horizontal sway - increases during blow
        const blowSway = blowingRef.current ? blowProgressRef.current * 0.05 : 0;
        group.outer.position.x = Math.sin(time * 3 + offset) * 0.01 + blowSway;
        group.outer.position.z = Math.cos(time * 2.5 + offset) * 0.01;
        
        // Vertical stretch and squash - shrinks when blowing
        const stretch = (1 + mainFlicker * 0.3) * flickerIntensity;
        group.outer.scale.set(
          (1 - mainFlicker * 0.2) * flickerIntensity, 
          stretch, 
          (1 - mainFlicker * 0.2) * flickerIntensity
        );
        
        // Color and intensity variation - dims when blowing
        outerMaterial.emissiveIntensity = (1.5 + mainFlicker * 0.8) * flickerIntensity;
        outerMaterial.opacity = 0.85 * flickerIntensity;
        const colorShift = Math.sin(time * 5 + offset) * 0.1;
        outerMaterial.emissive.setRGB(1, 0.3 + colorShift, 0);
      }
      
      // Animate inner flame
      if (group.inner) {
        const innerMaterial = group.inner.material as THREE.MeshStandardMaterial;
        
        // More energetic movement
        group.inner.position.x = Math.sin(time * 4 + offset) * 0.008;
        group.inner.position.z = Math.cos(time * 3.5 + offset) * 0.008;
        group.inner.position.y = Math.sin(time * 6 + offset) * 0.005;
        
        const innerStretch = (1 + mainFlicker * 0.4) * flickerIntensity;
        group.inner.scale.set(
          (1 - mainFlicker * 0.15) * flickerIntensity, 
          innerStretch, 
          (1 - mainFlicker * 0.15) * flickerIntensity
        );
        
        innerMaterial.emissiveIntensity = (2 + mainFlicker * 1.2) * flickerIntensity;
        innerMaterial.opacity = 0.9 * flickerIntensity;
      }
      
      // Animate core (brightest part)
      if (group.core) {
        const coreMaterial = group.core.material as THREE.MeshStandardMaterial;
        
        // Subtle movement
        group.core.position.y = Math.sin(time * 8 + offset) * 0.003;
        
        const coreStretch = (1 + mainFlicker * 0.5) * flickerIntensity;
        group.core.scale.set(flickerIntensity, coreStretch, flickerIntensity);
        
        coreMaterial.emissiveIntensity = (3 + mainFlicker * 1.5) * flickerIntensity;
        coreMaterial.opacity = 0.95 * flickerIntensity;
      }
      
      // Animate light
      if (group.light) {
        group.light.intensity = (1.8 + mainFlicker * 0.6) * flickerIntensity;
        
        // Subtle color shift
        const hue = 0.1 + Math.sin(time * 3 + offset) * 0.02;
        group.light.color.setHSL(hue, 1, 0.6);
      }
      
      // Animate smoke particles - more smoke when blowing
      group.smoke.forEach((particle, j) => {
        if (particle) {
          const smokeMaterial = particle.material as THREE.MeshStandardMaterial;
          const particleOffset = j * 0.5;
          
          // Rise and fade - faster when blowing
          const riseSpeed = candlesLit ? 0.008 : 0.015;
          particle.position.y += riseSpeed;
          particle.position.x += Math.sin(time * 2 + particleOffset) * 0.002;
          particle.position.z += Math.cos(time * 1.8 + particleOffset) * 0.002;
          
          // Fade out as it rises
          const maxHeight = candlesLit ? 0.3 : 0.5;
          if (particle.position.y > maxHeight) {
            particle.position.y = 0.05 + j * 0.02;
            particle.position.x = 0;
            particle.position.z = 0;
            smokeMaterial.opacity = candlesLit ? 0.3 : 0.5;
          } else {
            const baseOpacity = candlesLit ? 0.3 : 0.5;
            smokeMaterial.opacity = Math.max(0, baseOpacity - particle.position.y);
          }
          
          // Grow as it rises - larger when extinguished
          const growFactor = (1 + particle.position.y * 2) * (candlesLit ? 1 : 1.5);
          particle.scale.setScalar(growFactor);
        }
      });

      // Animate fire sparks
      group.sparks.forEach((spark, j) => {
        if (spark) {
          const sparkMaterial = spark.material as THREE.MeshStandardMaterial;
          const sparkOffset = i * 2 + j;
          
          // Rotate and flicker
          const angle = (j / 4) * Math.PI * 2 + time * 2;
          const radius = 0.035 + Math.sin(time * 5 + sparkOffset) * 0.008;
          
          spark.position.x = Math.cos(angle) * radius;
          spark.position.z = Math.sin(angle) * radius;
          spark.position.y = Math.sin(time * 4 + sparkOffset) * 0.015 + (j % 2) * 0.01;
          
          // Pulse intensity
          sparkMaterial.emissiveIntensity = 2.5 + Math.sin(time * 8 + sparkOffset) * 1;
          
          // Occasional pop
          const popFactor = Math.sin(time * 6 + sparkOffset);
          spark.scale.setScalar(popFactor > 0.9 ? 1.5 : 1);
        }
      });
    });

    // Animate floating hearts
    heartRefs.current.forEach((heart, i) => {
      if (heart) {
        const offset = i * 0.7;
        
        // Float up and down
        const baseY = 0.5 + i * 0.15;
        heart.position.y = baseY + Math.sin(time * 1.5 + offset) * 0.08;
        
        // Rotate slowly
        heart.rotation.y = time * 0.5 + i * Math.PI / 2;
        
        // Pulse scale
        const scalePulse = 1 + Math.sin(time * 2 + offset) * 0.15;
        heart.scale.setScalar(0.15 * scalePulse);
        
        // Subtle sway
        const angle = (i / 4) * Math.PI * 2 + time * 0.3;
        const radius = 0.85 + Math.sin(time * 2 + offset) * 0.05;
        heart.position.x = Math.cos(angle + Math.PI / 4) * radius;
        heart.position.z = Math.sin(angle + Math.PI / 4) * radius;
      }
    });
  });

  const cakePosition: [number, number, number] = [0, 1.05, -3];
  const layerHeight = 0.15;
  const baseRadius = 0.6;

  // Candle positions on top
  const candlePositions: [number, number, number][] = [
    [0, 0, 0],
    [0.15, 0, 0.15],
    [-0.15, 0, 0.15],
    [0.15, 0, -0.15],
    [-0.15, 0, -0.15],
  ];

  return (
    <group position={cakePosition}>
      {/* Layer 4 (Bottom) - Vanilla */}
      <Cylinder args={[baseRadius, baseRadius, layerHeight, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#fff8dc" 
          roughness={0.6}
          metalness={0.1}
        />
      </Cylinder>
      {/* Strawberry cream between layers */}
      <Cylinder args={[baseRadius - 0.05, baseRadius - 0.05, 0.03, 32]} position={[0, layerHeight / 2 + 0.015, 0]}>
        <meshStandardMaterial 
          color="#ff69b4" 
          roughness={0.3}
          metalness={0.2}
        />
      </Cylinder>

      {/* Layer 3 - Strawberry */}
      <Cylinder args={[baseRadius - 0.05, baseRadius - 0.05, layerHeight, 32]} position={[0, layerHeight + 0.03, 0]}>
        <meshStandardMaterial 
          color="#ffb6d9" 
          roughness={0.6}
          metalness={0.1}
        />
      </Cylinder>
      {/* Vanilla cream */}
      <Cylinder args={[baseRadius - 0.1, baseRadius - 0.1, 0.03, 32]} position={[0, layerHeight * 1.5 + 0.045, 0]}>
        <meshStandardMaterial 
          color="#fffacd" 
          roughness={0.3}
          metalness={0.2}
        />
      </Cylinder>

      {/* Layer 2 - Vanilla */}
      <Cylinder args={[baseRadius - 0.1, baseRadius - 0.1, layerHeight, 32]} position={[0, layerHeight * 2 + 0.06, 0]}>
        <meshStandardMaterial 
          color="#fff8dc" 
          roughness={0.6}
          metalness={0.1}
        />
      </Cylinder>
      {/* Strawberry cream */}
      <Cylinder args={[baseRadius - 0.15, baseRadius - 0.15, 0.03, 32]} position={[0, layerHeight * 2.5 + 0.075, 0]}>
        <meshStandardMaterial 
          color="#ff69b4" 
          roughness={0.3}
          metalness={0.2}
        />
      </Cylinder>

      {/* Layer 1 (Top) - Strawberry */}
      <Cylinder args={[baseRadius - 0.15, baseRadius - 0.15, layerHeight, 32]} position={[0, layerHeight * 3 + 0.09, 0]}>
        <meshStandardMaterial 
          color="#ffb6d9" 
          roughness={0.6}
          metalness={0.1}
        />
      </Cylinder>

      {/* Top frosting decoration */}
      <Cylinder args={[baseRadius - 0.15, baseRadius - 0.15, 0.02, 32]} position={[0, layerHeight * 3.5 + 0.1, 0]}>
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.2}
          metalness={0.3}
          emissive="#ffb6c1"
          emissiveIntensity={0.2}
        />
      </Cylinder>

      {/* Strawberry decorations on top */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 0.35;
        return (
          <Sphere
            key={`strawberry-${i}`}
            args={[0.035, 16, 16]}
            position={[
              Math.cos(angle) * radius,
              layerHeight * 3.5 + 0.13,
              Math.sin(angle) * radius,
            ]}
          >
            <meshStandardMaterial 
              color="#ff1744" 
              roughness={0.7}
              metalness={0.1}
            />
          </Sphere>
        );
      })}

      {/* Candles */}
      {candlePositions.map((pos, i) => {
        const candleHeight = 0.25;
        const candleY = layerHeight * 3.5 + 0.11 + candleHeight / 2;
        const flameY = candleHeight / 2 + 0.05;
        
        // Initialize flame group for this candle
        if (!flameGroups.current[i]) {
          flameGroups.current[i] = {
            outer: null,
            inner: null,
            core: null,
            light: null,
            smoke: [],
            sparks: []
          };
        }
        
        return (
          <group key={`candle-${i}`} position={[pos[0], candleY, pos[2]]}>
            {/* Candle body */}
            <Cylinder args={[0.015, 0.015, candleHeight, 16]}>
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#ff69b4" : "#87ceeb"}
                roughness={0.4}
                metalness={0.6}
              />
            </Cylinder>
            
            {/* Wick */}
            <Cylinder 
              args={[0.002, 0.002, 0.03, 8]} 
              position={[0, candleHeight / 2 + 0.02, 0]}
            >
              <meshStandardMaterial color="#222222" />
            </Cylinder>

            {/* Flame Group */}
            <group position={[0, flameY, 0]}>
              {/* Outer flame - teardrop shape */}
              <mesh
                ref={(el) => {
                  if (el && flameGroups.current[i]) {
                    flameGroups.current[i].outer = el;
                  }
                }}
              >
                <sphereGeometry args={[0.03, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.9]} />
                <meshStandardMaterial 
                  color="#ff3300"
                  emissive="#ff3300"
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Middle flame */}
              <mesh
                ref={(el) => {
                  if (el && flameGroups.current[i]) {
                    flameGroups.current[i].inner = el;
                  }
                }}
                position={[0, 0.005, 0]}
              >
                <sphereGeometry args={[0.02, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.85]} />
                <meshStandardMaterial 
                  color="#ff6600"
                  emissive="#ff6600"
                  emissiveIntensity={2}
                  transparent
                  opacity={0.9}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Inner core - brightest part */}
              <mesh
                ref={(el) => {
                  if (el && flameGroups.current[i]) {
                    flameGroups.current[i].core = el;
                  }
                }}
                position={[0, 0, 0]}
              >
                <sphereGeometry args={[0.01, 12, 12]} />
                <meshStandardMaterial 
                  color="#ffff66"
                  emissive="#ffff66"
                  emissiveIntensity={3}
                  transparent
                  opacity={0.95}
                />
              </mesh>

              {/* Glow aura around flame */}
              <mesh position={[0, 0.01, 0]}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial 
                  color="#ffaa00"
                  emissive="#ffaa00"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.3}
                  depthWrite={false}
                />
              </mesh>
            </group>

            {/* Smoke particles */}
            {[0, 1, 2].map((j) => (
              <mesh
                key={`smoke-${i}-${j}`}
                ref={(el) => {
                  if (el && flameGroups.current[i]) {
                    flameGroups.current[i].smoke[j] = el;
                  }
                }}
                position={[0, flameY + 0.05 + j * 0.02, 0]}
              >
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshStandardMaterial 
                  color="#999999"
                  transparent
                  opacity={0.3}
                  depthWrite={false}
                />
              </mesh>
            ))}

            {/* Fire sparks - tiny glowing particles */}
            {[0, 1, 2, 3].map((j) => {
              const angle = (j / 4) * Math.PI * 2;
              const sparkRadius = 0.035;
              return (
                <mesh
                  key={`spark-${i}-${j}`}
                  ref={(el) => {
                    if (el && flameGroups.current[i]) {
                      flameGroups.current[i].sparks[j] = el;
                    }
                  }}
                  position={[
                    Math.cos(angle) * sparkRadius,
                    flameY + (j % 2) * 0.01,
                    Math.sin(angle) * sparkRadius
                  ]}
                >
                  <sphereGeometry args={[0.003, 6, 6]} />
                  <meshStandardMaterial 
                    color="#ffff00"
                    emissive="#ffff00"
                    emissiveIntensity={2.5}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              );
            })}

            {/* Dynamic point light */}
            <pointLight
              ref={(el) => {
                if (el && flameGroups.current[i]) {
                  flameGroups.current[i].light = el;
                }
              }}
              position={[0, flameY, 0]}
              color="#ffaa33"
              intensity={1.8}
              distance={1.5}
              decay={2}
              castShadow
            />
          </group>
        );
      })}

      {/* Plate under the cake */}
      <Cylinder args={[baseRadius + 0.15, baseRadius + 0.15, 0.02, 32]} position={[0, -0.02, 0]}>
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.2}
          metalness={0.8}
        />
      </Cylinder>
      
      {/* Additional floating hearts */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 0.85;
        const height = 0.5 + i * 0.15;
        
        return (
          <group
            key={`heart-${i}`}
            ref={(el) => {
              if (el) heartRefs.current[i] = el;
            }}
            position={[
              Math.cos(angle + Math.PI / 4) * radius,
              height,
              Math.sin(angle + Math.PI / 4) * radius,
            ]}
            rotation={[0, angle, 0]}
            scale={0.15}
          >
            {/* Heart shape using two spheres and a box */}
            <mesh position={[-0.15, 0.15, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial 
                color="#ff69b4"
                emissive="#ff1493"
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[0.15, 0.15, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial 
                color="#ff69b4"
                emissive="#ff1493"
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.35, 0.35, 0.3]} />
              <meshStandardMaterial 
                color="#ff69b4"
                emissive="#ff1493"
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

