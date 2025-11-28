import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

export const BreathEffect = () => {
  const { camera } = useThree();
  const particlesRef = useRef<THREE.Points | null>(null);
  const breathLightRef = useRef<THREE.PointLight | null>(null);
  const [isBlowing, setIsBlowing] = useState(false);
  const particlesArray = useRef<Particle[]>([]);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  
  const maxParticles = 300; // زيادة عدد الجزيئات
  const cakePosition = new THREE.Vector3(0, 1.05, -3);

  useEffect(() => {
    const handleBlowCandles = () => {
      console.log('🌬️ Starting breath effect!');
      setIsBlowing(true);
      
      // Stop after 3 seconds for longer, more visible animation
      setTimeout(() => {
        setIsBlowing(false);
        particlesArray.current = [];
      }, 3000);
    };

    window.addEventListener('blowCandles', handleBlowCandles);
    return () => window.removeEventListener('blowCandles', handleBlowCandles);
  }, []);

  useEffect(() => {
    // Create geometry for particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);
    const alphas = new Float32Array(maxParticles);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    
    geometryRef.current = geometry;
    
    return () => {
      geometry.dispose();
    };
  }, []);

  useFrame((state, delta) => {
    if (!geometryRef.current) return;
    
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const sizes = geometryRef.current.attributes.size.array as Float32Array;
    const alphas = geometryRef.current.attributes.alpha.array as Float32Array;
    
    // Update breath light position to follow the breath stream
    if (breathLightRef.current && particlesArray.current.length > 0) {
      // Find average position of particles
      const avgPos = new THREE.Vector3();
      let count = 0;
      particlesArray.current.forEach(particle => {
        if (particle.life > 0.5) { // Only use newer particles
          avgPos.add(particle.position);
          count++;
        }
      });
      if (count > 0) {
        avgPos.divideScalar(count);
        breathLightRef.current.position.copy(avgPos);
        breathLightRef.current.intensity = isBlowing ? 2.0 : 0;
      }
    }
    
    // Add new particles when blowing
    if (isBlowing && particlesArray.current.length < maxParticles) {
      // Create direction from camera to cake
      const direction = new THREE.Vector3();
      direction.subVectors(cakePosition, camera.position).normalize();
      
      // Add some randomness to the direction
      const randomSpread = 0.15;
      direction.x += (Math.random() - 0.5) * randomSpread;
      direction.y += (Math.random() - 0.5) * randomSpread;
      direction.z += (Math.random() - 0.5) * randomSpread;
      direction.normalize();
      
      // Start position: in front of camera (mouth position)
      const startOffset = new THREE.Vector3(0, -0.2, -0.3);
      startOffset.applyQuaternion(camera.quaternion);
      const startPos = camera.position.clone().add(startOffset);
      
      // Add multiple particles per frame for very dense effect
      for (let i = 0; i < 10; i++) {
        // Add more variation to starting position for wider stream
        const posVariation = new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.15
        );
        posVariation.applyQuaternion(camera.quaternion);
        
        const particle: Particle = {
          position: startPos.clone().add(posVariation),
          velocity: direction.clone().multiplyScalar(3.5 + Math.random() * 2.5),
          life: 1.0,
          maxLife: 1.0,
          size: 0.2 + Math.random() * 0.4
        };
        particlesArray.current.push(particle);
      }
    }
    
    // Update existing particles
    particlesArray.current = particlesArray.current.filter((particle, index) => {
      // Update life - slower decay for longer visibility
      particle.life -= delta * 0.6;
      
      if (particle.life <= 0) {
        return false; // Remove dead particles
      }
      
      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));
      
      // Slow down particles over time - more gradual
      particle.velocity.multiplyScalar(0.96);
      
      // Add slight upward drift
      particle.position.y += delta * 0.15;
      
      // Add subtle wave motion for more realistic air flow
      const time = (1.0 - particle.life) * 5.0;
      particle.position.x += Math.sin(time * 2.0) * delta * 0.3;
      particle.position.y += Math.cos(time * 1.5) * delta * 0.2;
      
      // Update buffers
      if (index < maxParticles) {
        positions[index * 3] = particle.position.x;
        positions[index * 3 + 1] = particle.position.y;
        positions[index * 3 + 2] = particle.position.z;
        
        // Size grows more dramatically over time for better visibility
        sizes[index] = particle.size * (2.5 - particle.life * 0.4);
        
        // Better fade out curve - stays visible longer and brighter
        alphas[index] = Math.pow(particle.life, 0.4) * 1.0;
      }
      
      return true;
    });
    
    // Clear unused particles
    for (let i = particlesArray.current.length; i < maxParticles; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      sizes[i] = 0;
      alphas[i] = 0;
    }
    
    // Update geometry
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.attributes.size.needsUpdate = true;
    geometryRef.current.attributes.alpha.needsUpdate = true;
    
    geometryRef.current.computeBoundingSphere();
  });

  return (
    <>
      {/* Light that follows the breath stream */}
      <pointLight
        ref={breathLightRef}
        color="#c0e0ff"
        intensity={0}
        distance={3}
        decay={2}
      />
      
      {/* Main breath particles - white/light blue */}
      <points ref={particlesRef}>
        <bufferGeometry ref={geometryRef} />
        <pointsMaterial
          size={0.5}
          transparent
          opacity={0.8}
          color="#c0e0ff"
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          vertexColors={false}
          fog={false}
        />
      </points>
    </>
  );
};

