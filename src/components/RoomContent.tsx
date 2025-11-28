import { Box, Cylinder, Plane, Sphere, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Suspense } from "react";
import image1 from "@/assets/image 1.png";
import image2 from "@/assets/image 2.png";
import image3 from "@/assets/image 3.png";
import image4 from "@/assets/image 4.png";
import image5 from "@/assets/image 5.png";
import image6 from "@/assets/image 6.png";
import frameBgImage from "@/assets/frame-bg.jpg";
import { BirthdayCake } from "./BirthdayCake";
import { FlowerBouquet } from "./FlowerBouquet";
import { PickableFrame } from "./PickableFrame";

// Helper function to calculate frame dimensions based on image aspect ratio
const calculateFrameDimensions = (texture: THREE.Texture, maxSize = 0.9) => {
  const image = texture.image as HTMLImageElement | undefined;
  const imageWidth = image?.width || 1;
  const imageHeight = image?.height || 1;
  const aspectRatio = imageWidth / imageHeight;
  
  let photoWidth: number;
  let photoHeight: number;
  
  if (aspectRatio > 1.2) {
    // Landscape
    photoWidth = maxSize;
    photoHeight = maxSize / aspectRatio;
  } else if (aspectRatio < 0.8) {
    // Portrait
    photoHeight = maxSize;
    photoWidth = maxSize * aspectRatio;
  } else {
    // Square-ish
    const avgSize = maxSize * 0.85;
    if (aspectRatio >= 1) {
      photoWidth = avgSize;
      photoHeight = avgSize / aspectRatio;
    } else {
      photoHeight = avgSize;
      photoWidth = avgSize * aspectRatio;
    }
  }
  
  const padding = 0.08;
  return {
    photoWidth,
    photoHeight,
    frameWidth: photoWidth + padding * 2,
    frameHeight: photoHeight + padding * 2
  };
};

const TexturedObjects = () => {
  const [img1Texture, img2Texture, img3Texture, img4Texture, img5Texture, img6Texture] = useTexture([
    image1, image2, image3, image4, image5, image6
  ]);

  // Optimize all textures for better performance
  [img1Texture, img2Texture, img3Texture, img4Texture, img5Texture, img6Texture].forEach(texture => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = 1; // Reduce anisotropic filtering for better performance
  });

  return (
    <>
      {/* Victorian-style Photo Frames on Table - Now Pickable! */}
      {/* Frame 1 */}
      <PickableFrame
        id="frame-1"
        position={[-1.1, 1.35, -2.3]}
        rotation={[0, 0.3, 0]}
        scale={0.6}
        imageUrl={image1}
      />

      {/* Frame 2 */}
      <PickableFrame
        id="frame-2"
        position={[-0.5, 1.35, -2.1]}
        rotation={[0, 0.1, 0]}
        scale={0.55}
        imageUrl={image2}
      />

      {/* Frame 3 */}
      <PickableFrame
        id="frame-3"
        position={[0.5, 1.35, -2.1]}
        rotation={[0, -0.1, 0]}
        scale={0.55}
        imageUrl={image3}
      />

      {/* Frame 4 */}
      <PickableFrame
        id="frame-4"
        position={[1.1, 1.35, -2.3]}
        rotation={[0, -0.3, 0]}
        scale={0.6}
        imageUrl={image4}
      />

      {/* Frame 5 */}
      <PickableFrame
        id="frame-5"
        position={[-0.7, 1.35, -3.7]}
        rotation={[0, 0.2, 0]}
        scale={0.5}
        imageUrl={image5}
      />

      {/* Frame 6 */}
      <PickableFrame
        id="frame-6"
        position={[0.7, 1.35, -3.7]}
        rotation={[0, -0.2, 0]}
        scale={0.5}
        imageUrl={image6}
      />

      {/* Photo frames gallery on back wall - REDUCED for performance */}
      {/* Row 1 - Top */}
      {[-6, 0, 6].map((x, i) => {
        const textures = [img1Texture, img3Texture, img5Texture];
        const dims = calculateFrameDimensions(textures[i], 1.0);
        return (
          <group key={`back-top-${i}`} position={[x, 3.5, -9.9]}>
            <Box args={[dims.frameWidth, dims.frameHeight, 0.08]} castShadow>
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </Box>
            <Plane args={[dims.photoWidth, dims.photoHeight]} position={[0, 0, 0.05]}>
              <meshStandardMaterial map={textures[i]} />
            </Plane>
          </group>
        );
      })}
      
      {/* Row 2 - Middle - REDUCED */}
      {[-6, 0, 6].map((x, i) => {
        const textures = [img6Texture, img2Texture, img4Texture];
        const dims = calculateFrameDimensions(textures[i], 0.9);
        return (
          <group key={`back-mid-${i}`} position={[x, 2, -9.9]}>
            <Box args={[dims.frameWidth, dims.frameHeight, 0.08]} castShadow>
              <meshStandardMaterial color="#ffc0cb" metalness={0.7} roughness={0.3} />
            </Box>
            <Plane args={[dims.photoWidth, dims.photoHeight]} position={[0, 0, 0.05]}>
              <meshStandardMaterial map={textures[i]} />
            </Plane>
          </group>
        );
      })}

      {/* Left wall gallery - REDUCED */}
      {[[-9.9, 3, -6], [-9.9, 3, 0], [-9.9, 3, 6]].map((pos, i) => {
        const textures = [img3Texture, img5Texture, img1Texture];
        const dims = calculateFrameDimensions(textures[i], 0.9);
        return (
          <group key={`left-${i}`} position={pos as [number, number, number]} rotation={[0, Math.PI / 2, 0]}>
            <Box args={[dims.frameWidth, dims.frameHeight, 0.08]} castShadow>
              <meshStandardMaterial color="#daa520" metalness={0.8} roughness={0.2} />
            </Box>
            <Plane args={[dims.photoWidth, dims.photoHeight]} position={[0, 0, 0.05]}>
              <meshStandardMaterial map={textures[i]} />
            </Plane>
          </group>
        );
      })}

      {/* Right wall gallery - REDUCED */}
      {[[9.9, 3, -6], [9.9, 3, 0], [9.9, 3, 6]].map((pos, i) => {
        const textures = [img2Texture, img4Texture, img6Texture];
        const dims = calculateFrameDimensions(textures[i], 0.9);
        return (
          <group key={`right-${i}`} position={pos as [number, number, number]} rotation={[0, -Math.PI / 2, 0]}>
            <Box args={[dims.frameWidth, dims.frameHeight, 0.08]} castShadow>
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </Box>
            <Plane args={[dims.photoWidth, dims.photoHeight]} position={[0, 0, 0.05]}>
              <meshStandardMaterial map={textures[i]} />
            </Plane>
          </group>
        );
      })}
    </>
  );
};

export const RoomContent = () => {

  return (
    <>
      {/* Floor - Wooden parquet */}
      <Plane
        args={[20, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#d4a574" 
          roughness={0.8}
          metalness={0.1}
        />
      </Plane>

      {/* Luxury Persian Carpet - Detailed */}
      {/* Main carpet base */}
      <Plane
        args={[5.2, 4.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, -3]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#4a0000" 
          roughness={0.95}
        />
      </Plane>

      {/* Inner carpet - main area */}
      <Plane
        args={[4.8, 4]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, -3]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#8b0000" 
          roughness={0.9}
          emissive="#3d0000"
          emissiveIntensity={0.08}
        />
      </Plane>

      {/* Ornate border - gold outer */}
      {/* Top border */}
      <Plane args={[5.2, 0.25]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, -5.075]} receiveShadow>
        <meshStandardMaterial color="#d4af37" roughness={0.8} metalness={0.3} />
      </Plane>
      {/* Bottom border */}
      <Plane args={[5.2, 0.25]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, -0.925]} receiveShadow>
        <meshStandardMaterial color="#d4af37" roughness={0.8} metalness={0.3} />
      </Plane>
      {/* Left border */}
      <Plane args={[0.25, 3.9]} rotation={[-Math.PI / 2, 0, 0]} position={[-2.475, 0.011, -3]} receiveShadow>
        <meshStandardMaterial color="#d4af37" roughness={0.8} metalness={0.3} />
      </Plane>
      {/* Right border */}
      <Plane args={[0.25, 3.9]} rotation={[-Math.PI / 2, 0, 0]} position={[2.475, 0.011, -3]} receiveShadow>
        <meshStandardMaterial color="#d4af37" roughness={0.8} metalness={0.3} />
      </Plane>

      {/* Decorative patterns - geometric */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((x, i) => (
        <Box 
          key={`carpet-pattern-x-${i}`}
          args={[0.15, 0.01, 0.15]} 
          position={[x, 0.012, -3]} 
          rotation={[0, Math.PI / 4, 0]}
        >
          <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.4} />
        </Box>
      ))}

      {/* Center medallion */}
      <Cylinder args={[0.4, 0.4, 0.01]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.013, -3]}>
        <meshStandardMaterial color="#8b6914" roughness={0.7} metalness={0.4} />
      </Cylinder>
      <Cylinder args={[0.3, 0.3, 0.012]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.0135, -3]}>
        <meshStandardMaterial color="#ffd700" roughness={0.6} metalness={0.5} />
      </Cylinder>
      {/* Center star pattern */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <Box 
            key={`star-${i}`}
            args={[0.08, 0.012, 0.25]} 
            position={[Math.cos(rad) * 0.12, 0.014, -3 + Math.sin(rad) * 0.12]}
            rotation={[0, -angle * Math.PI / 180, 0]}
          >
            <meshStandardMaterial color="#b8860b" metalness={0.5} roughness={0.5} />
          </Box>
        );
      })}

      {/* Corner ornaments */}
      {[[-2, -4.5], [2, -4.5], [-2, -1.5], [2, -1.5]].map((pos, i) => (
        <Cylinder 
          key={`corner-ornament-${i}`}
          args={[0.15, 0.15, 0.01]} 
          rotation={[Math.PI / 2, 0, 0]} 
          position={[pos[0], 0.013, pos[1]]}
        >
          <meshStandardMaterial color="#daa520" metalness={0.6} roughness={0.5} />
        </Cylinder>
      ))}

      {/* Fringe on ends */}
      {Array.from({ length: 20 }, (_, i) => {
        const x = -2.4 + (i * 4.8) / 19;
        return (
          <group key={`fringe-top-${i}`}>
            <Box args={[0.03, 0.01, 0.2]} position={[x, 0.01, -5.2]}>
              <meshStandardMaterial color="#654321" roughness={0.9} />
            </Box>
            <Box args={[0.03, 0.01, 0.2]} position={[x, 0.01, -0.8]}>
              <meshStandardMaterial color="#654321" roughness={0.9} />
            </Box>
          </group>
        );
      })}

      {/* Walls with wallpaper texture simulation */}
      <Plane args={[20, 8]} position={[0, 4, -10]} receiveShadow>
        <meshStandardMaterial 
          color="#fff0f5" 
          roughness={0.9}
          side={THREE.DoubleSide} 
        />
      </Plane>
      <Plane args={[20, 8]} rotation={[0, Math.PI / 2, 0]} position={[-10, 4, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#fff5ee" 
          roughness={0.9}
          side={THREE.DoubleSide} 
        />
      </Plane>
      <Plane args={[20, 8]} rotation={[0, -Math.PI / 2, 0]} position={[10, 4, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#fff5ee" 
          roughness={0.9}
          side={THREE.DoubleSide} 
        />
      </Plane>

      {/* Ceiling with details */}
      <Plane args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#f8f8ff" 
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </Plane>

      {/* Crown molding - ceiling border */}
      {[
        [0, 7.9, -10, [20, 0.2, 0.2], 0],
        [-10, 7.9, 0, [0.2, 0.2, 20], Math.PI / 2],
        [10, 7.9, 0, [0.2, 0.2, 20], Math.PI / 2]
      ].map((data, i) => (
        <Box 
          key={`molding-${i}`}
          args={data[3] as [number, number, number]} 
          position={data.slice(0, 3) as [number, number, number]}
          rotation={[0, data[4] as number, 0]}
        >
          <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.5} />
      </Box>
      ))}

      {/* Luxury Crystal Chandelier - Highly Detailed */}
      <group position={[0, 6.5, -3]}>
        {/* Ceiling mount - ornate */}
        <Cylinder args={[0.25, 0.25, 0.15]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.85, 0]} castShadow>
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
      </Cylinder>
        <Cylinder args={[0.2, 0.2, 0.08]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.77, 0]} castShadow>
          <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.2} />
      </Cylinder>
        {/* Decorative rosette */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <Sphere 
              key={`rosette-${i}`}
              args={[0.04, 12, 12]} 
              position={[Math.cos(rad) * 0.22, 0.78, Math.sin(rad) * 0.22]} 
              castShadow
            >
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
            </Sphere>
          );
        })}

        {/* Main chain - ornate links */}
        {[0, 0.3, 0.6, 0.9, 1.2].map((y, i) => (
          <group key={`chain-link-${i}`} position={[0, 0.7 - y, 0]}>
            <Cylinder args={[0.025, 0.025, 0.25]} castShadow>
              <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
      </Cylinder>
            <Sphere args={[0.035, 12, 12]} position={[0, 0.13, 0]} castShadow>
              <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
            </Sphere>
          </group>
        ))}

        {/* Upper crown - ornate gold */}
        <group position={[0, -0.6, 0]}>
          <Cylinder args={[0.4, 0.35, 0.2]} castShadow>
            <meshStandardMaterial 
              color="#ffd700" 
              metalness={0.95} 
              roughness={0.05}
              emissive="#ffeb3b"
              emissiveIntensity={0.2}
            />
      </Cylinder>
          {/* Crown decorations */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <Sphere 
                key={`crown-jewel-${i}`}
                args={[0.05, 12, 12]} 
                position={[Math.cos(rad) * 0.38, 0, Math.sin(rad) * 0.38]} 
                castShadow
              >
                <meshStandardMaterial 
                  color={i % 2 === 0 ? "#ff1493" : "#87ceeb"} 
                  metalness={0.3}
                  roughness={0.1}
                  emissive={i % 2 === 0 ? "#ff1493" : "#87ceeb"}
                  emissiveIntensity={0.5}
                />
              </Sphere>
            );
          })}
        </group>

        {/* Main crystal body - multi-tiered */}
        <group position={[0, -0.8, 0]}>
          {/* Central sphere - large */}
          <Sphere args={[0.35, 24, 24]} castShadow>
            <meshStandardMaterial 
              color="#ffd700" 
              metalness={0.95} 
              roughness={0.05}
              emissive="#ffeb3b"
              emissiveIntensity={0.4}
            />
          </Sphere>
          
          {/* Crystal prisms - tier 1 (top) */}
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <group key={`prism-tier1-${i}`} position={[Math.cos(rad) * 0.45, 0.15, Math.sin(rad) * 0.45]}>
                <Cylinder args={[0.04, 0.02, 0.5]} castShadow>
                  <meshStandardMaterial 
                    color="#ffffff" 
                    metalness={0.05}
                    roughness={0.0}
                    transparent
                    opacity={0.95}
                    envMapIntensity={1.5}
                  />
                </Cylinder>
                {/* Crystal facet at top */}
                <Sphere args={[0.045, 8, 8]} position={[0, 0.26, 0]} castShadow>
                  <meshStandardMaterial 
                    color="#ffffff" 
                    metalness={0.05}
                    roughness={0.0}
                    transparent
                    opacity={0.95}
                  />
                </Sphere>
                {/* Teardrop crystal at bottom */}
                <group position={[0, -0.27, 0]}>
                  <Sphere args={[0.06, 12, 12]} scale={[1, 1.3, 1]} castShadow>
                    <meshStandardMaterial 
                      color="#e0f7ff" 
                      metalness={0.1}
                      roughness={0.0}
                      transparent
                      opacity={0.92}
                    />
                  </Sphere>
                  <pointLight position={[0, 0, 0]} color="#fff5e6" intensity={0.35} distance={2.5} />
                </group>
              </group>
            );
          })}

          {/* Crystal prisms - tier 2 (middle) */}
          {[20, 60, 100, 140, 180, 220, 260, 300, 340].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <group key={`prism-tier2-${i}`} position={[Math.cos(rad) * 0.55, -0.05, Math.sin(rad) * 0.55]}>
                <Cylinder args={[0.045, 0.025, 0.6]} castShadow>
                  <meshStandardMaterial 
                    color="#ffffff" 
                    metalness={0.05}
                    roughness={0.0}
                    transparent
                    opacity={0.95}
                  />
                </Cylinder>
                {/* Crystal bead */}
                <Sphere args={[0.05, 10, 10]} position={[0, 0.32, 0]} castShadow>
                  <meshStandardMaterial 
                    color="#ffe4e1" 
                    metalness={0.1}
                    roughness={0.0}
                    transparent
                    opacity={0.93}
                  />
                </Sphere>
                {/* Larger teardrop */}
                <group position={[0, -0.32, 0]}>
                  <Sphere args={[0.07, 12, 12]} scale={[1, 1.4, 1]} castShadow>
                    <meshStandardMaterial 
                      color="#f0f8ff" 
                      metalness={0.1}
                      roughness={0.0}
                      transparent
                      opacity={0.92}
                    />
                  </Sphere>
                  <pointLight position={[0, 0, 0]} color="#fff8dc" intensity={0.4} distance={3} />
                </group>
              </group>
            );
          })}

          {/* Crystal prisms - tier 3 (lower) */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <group key={`prism-tier3-${i}`} position={[Math.cos(rad) * 0.65, -0.25, Math.sin(rad) * 0.65]}>
                <Cylinder args={[0.05, 0.03, 0.7]} castShadow>
                  <meshStandardMaterial 
                    color="#ffffff" 
                    metalness={0.05}
                    roughness={0.0}
                    transparent
                    opacity={0.95}
                  />
                </Cylinder>
                {/* Top bead */}
                <Sphere args={[0.055, 10, 10]} position={[0, 0.37, 0]} castShadow>
                  <meshStandardMaterial 
                    color="#fff0f5" 
                    metalness={0.1}
                    roughness={0.0}
                    transparent
                    opacity={0.93}
                  />
                </Sphere>
                {/* Largest teardrop */}
                <group position={[0, -0.37, 0]}>
                  <Sphere args={[0.08, 14, 14]} scale={[1, 1.5, 1]} castShadow>
                    <meshStandardMaterial 
                      color="#f5fffa" 
                      metalness={0.1}
                      roughness={0.0}
                      transparent
                      opacity={0.92}
                      emissive="#ffffff"
                      emissiveIntensity={0.1}
                    />
                  </Sphere>
                  <pointLight position={[0, 0, 0]} color="#fffacd" intensity={0.45} distance={3.5} />
                </group>
              </group>
            );
          })}

          {/* Decorative crystal chains between tiers */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <group key={`chain-decor-${i}`}>
                {[0, 1, 2, 3, 4].map((j) => (
                  <Sphere 
                    key={`bead-${j}`}
                    args={[0.03, 10, 10]} 
                    position={[
                      Math.cos(rad) * (0.42 + j * 0.05), 
                      0.05 - j * 0.08, 
                      Math.sin(rad) * (0.42 + j * 0.05)
                    ]} 
                    castShadow
                  >
                    <meshStandardMaterial 
                      color="#ffffff" 
                      metalness={0.05}
                      roughness={0.0}
                      transparent
                      opacity={0.9}
                    />
                  </Sphere>
                ))}
              </group>
            );
          })}

          {/* Central light - main illumination */}
          <pointLight position={[0, 0, 0]} color="#fff8dc" intensity={1.2} distance={10} />
          <pointLight position={[0, -0.3, 0]} color="#fffacd" intensity={0.8} distance={8} />
        </group>

        {/* Bottom ornament - gold finial */}
        <group position={[0, -1.5, 0]}>
          <Cylinder args={[0.08, 0.15, 0.25]} castShadow>
            <meshStandardMaterial 
              color="#ffd700" 
              metalness={0.95} 
              roughness={0.05}
              emissive="#ffeb3b"
              emissiveIntensity={0.3}
            />
          </Cylinder>
          <Sphere args={[0.12, 16, 16]} position={[0, -0.18, 0]} castShadow>
            <meshStandardMaterial 
              color="#d4af37" 
              metalness={0.95} 
              roughness={0.05}
            />
          </Sphere>
          {/* Final crystal drop */}
          <Sphere args={[0.1, 16, 16]} scale={[1, 1.6, 1]} position={[0, -0.35, 0]} castShadow>
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.05}
              roughness={0.0}
              transparent
              opacity={0.95}
              emissive="#ffffff"
              emissiveIntensity={0.15}
            />
          </Sphere>
          <pointLight position={[0, -0.35, 0]} color="#fff5e6" intensity={0.5} distance={3} />
        </group>
      </group>

      {/* Luxury Table - Mahogany with gold trim */}
      <group position={[0, 1, -3]}>
        {/* Main table top */}
        <Box args={[3.2, 0.12, 2.2]} castShadow>
          <meshStandardMaterial 
            color="#3d1f00" 
            metalness={0.4} 
            roughness={0.5}
            emissive="#1a0d00"
            emissiveIntensity={0.1}
          />
        </Box>
        {/* Gold trim */}
        <Box args={[3.3, 0.05, 2.3]} position={[0, 0.08, 0]} castShadow>
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </Box>
        {/* Ornate legs */}
        {[[-1.3, -0.5, -0.9], [1.3, -0.5, -0.9], [-1.3, -0.5, 0.9], [1.3, -0.5, 0.9]].map((pos, i) => (
          <group key={`leg-${i}`} position={pos as [number, number, number]}>
            <Cylinder args={[0.08, 0.12, 1]} castShadow>
              <meshStandardMaterial color="#4a2511" metalness={0.3} roughness={0.6} />
            </Cylinder>
            <Sphere args={[0.1, 8, 8]} position={[0, -0.5, 0]} castShadow>
              <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
            </Sphere>
          </group>
        ))}
      </group>

      {/* Luxury Dining Chairs - Victorian Style */}
      {[
        [-1.8, 0.5, -3, 0],
        [1.8, 0.5, -3, Math.PI],
        [0, 0.5, -4.5, Math.PI / 2],
        [0, 0.5, -1.5, -Math.PI / 2]
      ].map((data, i) => (
        <group key={`chair-${i}`} position={data.slice(0, 3) as [number, number, number]} rotation={[0, data[3] as number, 0]}>
          {/* Seat - padded with details */}
          <Box args={[0.52, 0.12, 0.52]} castShadow>
            <meshStandardMaterial color="#6b0f1a" roughness={0.75} />
          </Box>
          {/* Seat piping */}
          <Box args={[0.54, 0.02, 0.54]} position={[0, 0.07, 0]} castShadow>
            <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
          </Box>
          
          {/* Backrest - ornate carved */}
          <group position={[0, 0.4, -0.22]}>
            {/* Main back panel */}
            <Box args={[0.5, 0.7, 0.12]} castShadow>
              <meshStandardMaterial color="#8b1a1a" roughness={0.7} />
            </Box>
            {/* Vertical slats - Victorian detail */}
            {[-0.15, 0, 0.15].map((x, j) => (
              <Cylinder key={`slat-${j}`} args={[0.02, 0.02, 0.6]} position={[x, 0, 0.07]} castShadow>
                <meshStandardMaterial color="#4a0f0f" roughness={0.6} />
              </Cylinder>
            ))}
            {/* Top rail - carved */}
            <Box args={[0.55, 0.1, 0.12]} position={[0, 0.37, 0]} castShadow>
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </Box>
            {/* Decorative finials */}
            {[-0.25, 0.25].map((x, j) => (
              <Sphere key={`finial-${j}`} args={[0.05, 8, 8]} position={[x, 0.42, 0]} castShadow>
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
              </Sphere>
            ))}
          </group>

          {/* Legs - turned and carved */}
          {[[-0.2, -0.25, -0.2], [0.2, -0.25, -0.2], [-0.2, -0.25, 0.2], [0.2, -0.25, 0.2]].map((pos, j) => (
            <group key={`chair-leg-group-${j}`} position={pos as [number, number, number]}>
              <Cylinder args={[0.035, 0.045, 0.5]} castShadow>
                <meshStandardMaterial color="#4a2511" roughness={0.5} />
      </Cylinder>
              {/* Leg decorative rings */}
              <Cylinder args={[0.05, 0.05, 0.03]} position={[0, 0.15, 0]} castShadow>
                <meshStandardMaterial color="#8b4513" roughness={0.4} />
      </Cylinder>
              <Cylinder args={[0.05, 0.05, 0.03]} position={[0, -0.1, 0]} castShadow>
                <meshStandardMaterial color="#8b4513" roughness={0.4} />
      </Cylinder>
              {/* Gold ferrule at bottom */}
              <Cylinder args={[0.05, 0.04, 0.04]} position={[0, -0.26, 0]} castShadow>
                <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </Cylinder>
            </group>
          ))}
          
          {/* Cross brace - structural detail */}
          <Box args={[0.45, 0.03, 0.03]} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color="#654321" roughness={0.6} />
          </Box>
          <Box args={[0.03, 0.03, 0.45]} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color="#654321" roughness={0.6} />
          </Box>
        </group>
      ))}

      <Suspense fallback={null}>
        <TexturedObjects />
      </Suspense>

      {/* Birthday Cake */}
      <BirthdayCake />

      {/* Flower Bouquet - lying horizontally on table next to cake */}
      <FlowerBouquet 
        position={[1.2, 1.1, -3.2]} 
        rotation={[Math.PI / 3, 0, Math.PI / 6]} 
        scale={2.0}
      />

      {/* Luxury Plants - Realistic Decorative */}
      {/* Plant 1 - Ornate Potted Ficus */}
      <group position={[8, 0, 6]}>
        {/* Decorative ceramic pot with patterns */}
        <Cylinder args={[0.25, 0.3, 0.5]} position={[0, 0.25, 0]} castShadow>
          <meshStandardMaterial color="#8b4513" roughness={0.6} metalness={0.1} />
        </Cylinder>
        {/* Pot rim - gold trim */}
        <Cylinder args={[0.32, 0.32, 0.06]} position={[0, 0.52, 0]} castShadow>
          <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
        </Cylinder>
        {/* Pot base */}
        <Cylinder args={[0.32, 0.28, 0.08]} position={[0, 0.02, 0]} castShadow>
          <meshStandardMaterial color="#654321" roughness={0.7} />
        </Cylinder>
        {/* Decorative bands on pot */}
        <Cylinder args={[0.255, 0.255, 0.03]} position={[0, 0.35, 0]} castShadow>
          <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
        </Cylinder>

        {/* Soil */}
        <Cylinder args={[0.24, 0.24, 0.05]} position={[0, 0.53, 0]} castShadow>
          <meshStandardMaterial color="#3d2817" roughness={0.9} />
        </Cylinder>

        {/* Plant - layered foliage */}
        {/* Bottom layer */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <Sphere 
              key={`foliage-bottom-${i}`}
              args={[0.25, 16, 16]} 
              position={[Math.cos(rad) * 0.15, 0.75, Math.sin(rad) * 0.15]} 
              castShadow
            >
              <meshStandardMaterial color="#1a5d1a" roughness={0.8} />
            </Sphere>
          );
        })}
        {/* Middle layer */}
        {[30, 90, 150, 210, 270, 330].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <Sphere 
              key={`foliage-mid-${i}`}
              args={[0.22, 16, 16]} 
              position={[Math.cos(rad) * 0.12, 0.95, Math.sin(rad) * 0.12]} 
              castShadow
            >
              <meshStandardMaterial color="#228b22" roughness={0.75} />
            </Sphere>
          );
        })}
        {/* Top layer */}
        <Sphere args={[0.28, 16, 16]} position={[0, 1.15, 0]} castShadow>
          <meshStandardMaterial color="#32cd32" roughness={0.7} />
        </Sphere>
        <Sphere args={[0.2, 16, 16]} position={[0.1, 1.3, 0]} castShadow>
          <meshStandardMaterial color="#3cb371" roughness={0.7} />
        </Sphere>
      </group>

      {/* Plant 2 - Elegant Rose Plant */}
      <group position={[-8, 0, 6]}>
        {/* Ornate terracotta pot */}
        <Cylinder args={[0.18, 0.23, 0.4]} position={[0, 0.2, 0]} castShadow>
          <meshStandardMaterial color="#cd5c5c" roughness={0.7} />
        </Cylinder>
        {/* Pot patterns */}
        {[0.1, 0.2, 0.3].map((y, i) => (
          <Cylinder key={`pot-ring-${i}`} args={[0.19 + i * 0.01, 0.19 + i * 0.01, 0.02]} position={[0, y, 0]} castShadow>
            <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
          </Cylinder>
        ))}

        {/* Soil */}
        <Cylinder args={[0.17, 0.17, 0.04]} position={[0, 0.42, 0]} castShadow>
          <meshStandardMaterial color="#2f1a06" roughness={0.9} />
        </Cylinder>

        {/* Rose stems - multiple */}
        {[0, 0.2, -0.15].map((xOffset, i) => (
          <group key={`rose-stem-${i}`}>
            <Cylinder args={[0.02, 0.025, 0.9]} position={[xOffset, 0.85, 0]} castShadow>
              <meshStandardMaterial color="#0d5c0d" roughness={0.6} />
            </Cylinder>
            {/* Leaves */}
            {[0.6, 0.8, 1.0].map((yPos, j) => (
              <Box 
                key={`leaf-${j}`}
                args={[0.08, 0.15, 0.02]} 
                position={[xOffset + (j % 2 === 0 ? 0.08 : -0.08), yPos, 0]} 
                rotation={[0, 0, j % 2 === 0 ? -0.5 : 0.5]}
                castShadow
              >
                <meshStandardMaterial color="#228b22" roughness={0.7} />
              </Box>
            ))}
            {/* Rose bloom */}
            <group position={[xOffset, 1.25 + i * 0.1, 0]}>
              {/* Petals - layered */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, j) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <Sphere 
                    key={`petal-${j}`}
                    args={[0.06, 8, 8]} 
                    position={[Math.cos(rad) * 0.07, 0, Math.sin(rad) * 0.07]} 
                    castShadow
                  >
                    <meshStandardMaterial color="#ff1493" roughness={0.5} />
                  </Sphere>
                );
              })}
              {/* Center */}
              <Sphere args={[0.08, 12, 12]} castShadow>
                <meshStandardMaterial color="#c71585" roughness={0.4} />
              </Sphere>
              {/* Inner petals */}
              {[0, 120, 240].map((angle, j) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <Sphere 
                    key={`inner-petal-${j}`}
                    args={[0.04, 8, 8]} 
                    position={[Math.cos(rad) * 0.04, 0.02, Math.sin(rad) * 0.04]} 
                    castShadow
                  >
                    <meshStandardMaterial color="#ff69b4" roughness={0.4} />
                  </Sphere>
                );
              })}
            </group>
          </group>
        ))}
      </group>

      {/* Realistic Balloons - Glossy with Highlights */}
      {[
        [-4, 5, -8, '#ff69b4', 0.3],
        [-2, 5.5, -7, '#87ceeb', 0.35],
        [2, 5.2, -8.5, '#ffd700', 0.32],
        [4, 5.8, -7.5, '#ff1493', 0.28],
        [-6, 5.3, -6, '#ffb6c1', 0.33],
        [6, 5.6, -6.5, '#dda0dd', 0.31],
        [-5, 6, -5, '#ff1493', 0.3],
        [5, 5.9, -5.5, '#87ceeb', 0.29]
      ].map(([x, y, z, color, size], i) => (
        <group key={`balloon-${i}`} position={[x as number, y as number, z as number]}>
          {/* Main balloon body - slightly elongated top */}
          <Sphere args={[size as number, 20, 20]} scale={[1, 1.15, 1]} castShadow>
            <meshStandardMaterial 
              color={color as string} 
              roughness={0.2}
              metalness={0.15}
              emissive={color as string}
              emissiveIntensity={0.1}
            />
          </Sphere>
          {/* Highlight - glossy effect */}
          <Sphere 
            args={[(size as number) * 0.3, 12, 12]} 
            position={[-(size as number) * 0.4, (size as number) * 0.5, (size as number) * 0.4]} 
          >
            <meshStandardMaterial 
              color="#ffffff" 
              transparent
              opacity={0.4}
              roughness={0.1}
            />
          </Sphere>
          {/* Bottom knot */}
          <Sphere args={[0.04, 8, 8]} position={[0, -(size as number) * 1.15, 0]} castShadow>
            <meshStandardMaterial color={color as string} roughness={0.4} />
          </Sphere>
          {/* String - curly */}
          {[0, 1, 2, 3, 4].map((segment, j) => {
            const curlOffset = Math.sin(j * 0.8) * 0.05;
            return (
              <Cylinder 
                key={`string-${j}`}
                args={[0.008, 0.008, 0.15]} 
                position={[curlOffset, -(size as number) * 1.2 - j * 0.14, 0]}
                rotation={[0, 0, curlOffset * 2]}
              >
                <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
              </Cylinder>
            );
          })}
        </group>
      ))}

      {/* Hearts floating - MORE! */}
      {[
        [-3, 3, -5, 0.15],
        [3, 3.5, -6, 0.12],
        [0, 3.8, -7, 0.1],
        [-5, 4.2, -4, 0.13],
        [5, 4, -5, 0.14],
        [-2, 4.5, -8, 0.11],
        [2, 4.3, -7.5, 0.12],
        [0, 5, -6, 0.1]
      ].map(([x, y, z, size], i) => (
        <mesh key={`heart-${i}`} position={[x as number, y as number, z as number]} rotation={[0.5, 0.5 * i, 0]}>
          <sphereGeometry args={[size as number, 16, 16]} />
          <meshStandardMaterial 
            color={['#ff1493', '#ff69b4', '#ffb6c1', '#ff69b4'][i % 4]} 
            emissive={['#ff1493', '#ff69b4', '#ffb6c1', '#ff69b4'][i % 4]} 
            emissiveIntensity={0.5} 
          />
      </mesh>
      ))}

      {/* Wall Sconces (lights) */}
      <group position={[-9.5, 2.5, -5]}>
        <Box args={[0.2, 0.3, 0.2]} castShadow>
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </Box>
        <pointLight position={[0.5, 0, 0]} color="#fff5e6" intensity={0.4} distance={4} />
      </group>
      <group position={[9.5, 2.5, -5]}>
        <Box args={[0.2, 0.3, 0.2]} castShadow>
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </Box>
        <pointLight position={[-0.5, 0, 0]} color="#fff5e6" intensity={0.4} distance={4} />
      </group>

      {/* Baseboard trim */}
      {[
        [0, 0.1, -10, [20, 0.2, 0.1], 0],
        [-10, 0.1, 0, [0.1, 0.2, 20], Math.PI / 2],
        [10, 0.1, 0, [0.1, 0.2, 20], Math.PI / 2]
      ].map((data, i) => (
        <Box 
          key={`baseboard-${i}`}
          args={data[3] as [number, number, number]} 
          position={data.slice(0, 3) as [number, number, number]}
          rotation={[0, data[4] as number, 0]}
        >
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </Box>
      ))}

      {/* Decorative ceiling medallion around chandelier */}
      <Cylinder args={[1.2, 1.2, 0.1]} rotation={[Math.PI / 2, 0, 0]} position={[0, 7.95, -3]} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </Cylinder>
      <Cylinder args={[1, 1, 0.08]} rotation={[Math.PI / 2, 0, 0]} position={[0, 7.94, -3]} castShadow>
        <meshStandardMaterial color="#ffd700" metalness={0.6} roughness={0.3} />
      </Cylinder>

      {/* Corner decorative columns */}
      {[
        [-9.5, 1.5, -9.5],
        [9.5, 1.5, -9.5],
        [-9.5, 1.5, 9.5],
        [9.5, 1.5, 9.5]
      ].map((pos, i) => (
        <group key={`column-${i}`} position={pos as [number, number, number]}>
          <Cylinder args={[0.2, 0.25, 3]} castShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </Cylinder>
          <Box args={[0.5, 0.2, 0.5]} position={[0, 1.6, 0]} castShadow>
            <meshStandardMaterial color="#ffd700" metalness={0.7} roughness={0.2} />
          </Box>
        </group>
      ))}

      {/* Luxury Victorian Candles - Highly Detailed */}
      {[
        [5, 0.35, -9],
        [-5, 0.35, -9],
        [8, 0.35, 8],
        [-8, 0.35, 8]
      ].map((pos, i) => (
        <group key={`candle-${i}`} position={pos as [number, number, number]}>
          {/* Ornate base plate */}
          <Cylinder args={[0.2, 0.2, 0.03]} position={[0, -0.265, 0]} castShadow>
            <meshStandardMaterial color="#3d1f00" roughness={0.6} metalness={0.2} />
          </Cylinder>
          
          {/* Gold decorative rim */}
          <Cylinder args={[0.21, 0.19, 0.05]} position={[0, -0.24, 0]} castShadow>
            <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
          </Cylinder>

          {/* Candlestick base - tiered */}
          <Cylinder args={[0.16, 0.16, 0.08]} position={[0, -0.2, 0]} castShadow>
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </Cylinder>
          
          {/* Decorative balls on base */}
          {[0, 90, 180, 270].map((angle, j) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <Sphere 
                key={`base-ball-${j}`}
                args={[0.025, 8, 8]} 
                position={[Math.cos(rad) * 0.16, -0.2, Math.sin(rad) * 0.16]} 
                castShadow
              >
                <meshStandardMaterial color="#ff1493" metalness={0.3} roughness={0.1} />
              </Sphere>
            );
          })}

          {/* Middle stem - ornate */}
          <Cylinder args={[0.08, 0.12, 0.25]} position={[0, -0.075, 0]} castShadow>
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </Cylinder>
          
          {/* Decorative rings on stem */}
          {[-0.15, -0.05, 0.05].map((y, j) => (
            <Cylinder 
              key={`ring-${j}`}
              args={[0.13, 0.13, 0.02]} 
              position={[0, y, 0]} 
              castShadow
            >
              <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
            </Cylinder>
          ))}

          {/* Candle holder cup */}
          <Cylinder args={[0.09, 0.07, 0.08]} position={[0, 0.08, 0]} castShadow>
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
          </Cylinder>
          
          {/* Drip catcher rim */}
          <Cylinder args={[0.12, 0.12, 0.02]} position={[0, 0.12, 0]} castShadow>
            <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
          </Cylinder>

          {/* Candle body - realistic wax */}
          <Cylinder args={[0.065, 0.065, 0.45]} position={[0, 0.25, 0]} castShadow>
            <meshStandardMaterial 
              color="#fffaf0" 
              roughness={0.85}
              metalness={0.05}
            />
          </Cylinder>

          {/* Melted wax drips - multiple layers */}
          {[
            { y: 0.35, scale: 1.1, height: 0.08 },
            { y: 0.28, scale: 1.15, height: 0.1 },
            { y: 0.20, scale: 1.2, height: 0.12 },
            { y: 0.12, scale: 1.15, height: 0.08 }
          ].map((drip, j) => (
            <Cylinder 
              key={`drip-${j}`}
              args={[0.065 * drip.scale, 0.065 * (drip.scale - 0.05), drip.height]} 
              position={[0, drip.y, 0]} 
              castShadow
            >
              <meshStandardMaterial 
                color="#fff8dc" 
                roughness={0.9}
                transparent
                opacity={0.8}
              />
            </Cylinder>
          ))}

          {/* Individual wax drip streams */}
          {[0, 120, 240].map((angle, j) => {
            const rad = (angle * Math.PI) / 180;
            const offset = 0.07;
            return (
              <group key={`drip-stream-${j}`}>
                {[0, 1, 2].map((k) => (
                  <Sphere 
                    key={`drop-${k}`}
                    args={[0.015, 8, 8]} 
                    position={[
                      Math.cos(rad) * offset, 
                      0.38 - k * 0.05, 
                      Math.sin(rad) * offset
                    ]} 
                    castShadow
                  >
                    <meshStandardMaterial 
                      color="#fffacd" 
                      roughness={0.7}
                      transparent
                      opacity={0.9}
                    />
                  </Sphere>
                ))}
              </group>
            );
          })}

          {/* Wick - burned */}
          <Cylinder args={[0.008, 0.008, 0.06]} position={[0, 0.51, 0]} castShadow>
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </Cylinder>
          
          {/* Wick tip - glowing */}
          <Sphere args={[0.012, 6, 6]} position={[0, 0.54, 0]}>
            <meshStandardMaterial 
              color="#ff6600" 
              emissive="#ff6600"
              emissiveIntensity={1.0}
            />
          </Sphere>

          {/* Flame - multi-layered realistic */}
          <group position={[0, 0.52, 0]}>
            {/* Inner core - white hot */}
            <Sphere args={[0.025, 12, 12]} scale={[1, 1.4, 1]}>
              <meshStandardMaterial 
                color="#ffffcc" 
                emissive="#ffffff"
                emissiveIntensity={1.2}
                transparent
                opacity={0.9}
              />
            </Sphere>
            
            {/* Middle layer - yellow */}
            <Sphere args={[0.04, 12, 12]} scale={[1, 1.5, 1]} position={[0, 0.01, 0]}>
              <meshStandardMaterial 
                color="#ffcc00" 
                emissive="#ffaa00"
                emissiveIntensity={1.0}
                transparent
                opacity={0.7}
              />
            </Sphere>
            
            {/* Outer layer - orange */}
            <Sphere args={[0.055, 12, 12]} scale={[1, 1.6, 1]} position={[0, 0.02, 0]}>
              <meshStandardMaterial 
                color="#ff8800" 
                emissive="#ff6600"
                emissiveIntensity={0.8}
                transparent
                opacity={0.5}
              />
            </Sphere>

            {/* Flame tip - flickering */}
            <Sphere args={[0.02, 10, 10]} scale={[0.8, 1.2, 0.8]} position={[0, 0.08, 0]}>
              <meshStandardMaterial 
                color="#ff6600" 
                emissive="#ff4400"
                emissiveIntensity={0.9}
                transparent
                opacity={0.6}
              />
            </Sphere>
          </group>

          {/* Smoke particles - subtle */}
          {[0, 1, 2].map((k) => (
            <Sphere 
              key={`smoke-${k}`}
              args={[0.015 + k * 0.005, 8, 8]} 
              position={[
                (Math.random() - 0.5) * 0.02, 
                0.62 + k * 0.08, 
                (Math.random() - 0.5) * 0.02
              ]}
            >
              <meshStandardMaterial 
                color="#cccccc" 
                transparent
                opacity={0.15 - k * 0.04}
                roughness={1.0}
              />
            </Sphere>
          ))}

          {/* Lighting - warm glow */}
          <pointLight 
            position={[0, 0.52, 0]} 
            color="#ffaa00" 
            intensity={0.6} 
            distance={4}
            decay={2}
          />
          
          {/* Additional ambient glow */}
          <pointLight 
            position={[0, 0.52, 0]} 
            color="#ff8844" 
            intensity={0.3} 
            distance={2.5}
            decay={2}
          />
        </group>
      ))}

      {/* Additional small decorative elements on table legs */}
      {[[-1.3, 0.9, -3.8], [1.3, 0.9, -3.8], [-1.3, 0.9, -2.2], [1.3, 0.9, -2.2]].map((pos, i) => (
        <Sphere key={`table-decor-${i}`} args={[0.08, 8, 8]} position={pos as [number, number, number]} castShadow>
          <meshStandardMaterial color="#ff69b4" metalness={0.6} roughness={0.3} />
        </Sphere>
      ))}
    </>
  );
};
