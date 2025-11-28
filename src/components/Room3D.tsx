import { Canvas } from "@react-three/fiber";
import { PointerLockControls, Sky, Stars } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef } from "react";
import { RoomContent } from "./RoomContent";
import { LoadingScreen } from "./LoadingScreen";
import { Instructions } from "./Instructions";
import { KeyboardControls } from "./KeyboardControls";
import { WishModal } from "./WishModal";
import { ObjectInteraction } from "./ObjectInteraction";
import { Crosshair } from "./Crosshair";
import { BreathEffect } from "./BreathEffect";
import songAudio from "@/assets/song.mp3";

export const Room3D = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [hasEnteredOnce, setHasEnteredOnce] = useState(false);
  const [distanceToCake, setDistanceToCake] = useState(10);
  const [showWishButton, setShowWishButton] = useState(false);
  const [holdingObject, setHoldingObject] = useState<{id: string, type: string} | null>(null);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [hoveredObjectType, setHoveredObjectType] = useState<string>('');
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [candlesBlownOut, setCandlesBlownOut] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Listen for object pickup (bouquet or frames)
  useEffect(() => {
    const handleObjectPickup = (e: CustomEvent) => {
      if (e.detail?.isHeld) {
        setHoldingObject({ id: e.detail.objectId, type: e.detail.type });
      } else {
        setHoldingObject(null);
      }
    };

    window.addEventListener('objectPickupChanged', handleObjectPickup as EventListener);
    window.addEventListener('bouquetPickupChanged', handleObjectPickup as EventListener);
    return () => {
      window.removeEventListener('objectPickupChanged', handleObjectPickup as EventListener);
      window.removeEventListener('bouquetPickupChanged', handleObjectPickup as EventListener);
    };
  }, []);

  // Listen for object hover (for crosshair)
  useEffect(() => {
    const handleObjectHover = (e: CustomEvent) => {
      setShowCrosshair(e.detail?.isHovering || false);
      setHoveredObjectType(e.detail?.type || '');
    };

    window.addEventListener('objectHoverChanged', handleObjectHover as EventListener);
    window.addEventListener('bouquetHoverChanged', handleObjectHover as EventListener);
    return () => {
      window.removeEventListener('objectHoverChanged', handleObjectHover as EventListener);
      window.removeEventListener('bouquetHoverChanged', handleObjectHover as EventListener);
    };
  }, []);

  // Show wish button when player is close to cake
  const handleDistanceChange = (distance: number) => {
    setDistanceToCake(distance);
    setShowWishButton(distance < 2.5);
  };

  // Control cursor visibility based on lock and modal state
  useEffect(() => {
    if (isLocked && !isWishModalOpen) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'auto';
    }
    
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [isLocked, isWishModalOpen]);

  // Listen for wish modal state changes
  useEffect(() => {
    const handleModalOpen = () => {
      setIsWishModalOpen(true);
      
      // Exit pointer lock to show cursor immediately
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      
      // Force cursor to show immediately
      document.body.style.cursor = 'auto';
      
      // Position camera at optimal viewing angle for blowing animation
      const event = new CustomEvent('positionCameraForWish');
      window.dispatchEvent(event);
      
      console.log('🖱️ Cursor shown for wish modal');
    };

    const handleModalClose = () => {
      setIsWishModalOpen(false);
      
      // Re-lock pointer after modal closes
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.requestPointerLock();
        }
      }, 100);
      
      console.log('🔒 Pointer locked again');
    };

    window.addEventListener('wishModalOpened', handleModalOpen);
    window.addEventListener('wishModalClosed', handleModalClose);
    
    return () => {
      window.removeEventListener('wishModalOpened', handleModalOpen);
      window.removeEventListener('wishModalClosed', handleModalClose);
    };
  }, []);

  // Listen for X key press to open wish modal (works with Arabic keyboard too)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check for X key (English) or ء (Arabic keyboard X position) or key code
      const isXKey = e.key.toLowerCase() === 'x' || 
                     e.key === 'ء' || 
                     e.code === 'KeyX' ||
                     e.keyCode === 88;
      
      if (isXKey && showWishButton && isLocked) {
        const event = new CustomEvent('openWishModal');
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showWishButton, isLocked]);

  // Listen for M key press to toggle mute (works with Arabic keyboard too)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check for M key (English) or Arabic keyboard M position or key code
      const isMKey = e.key.toLowerCase() === 'm' || 
                     e.code === 'KeyM' ||
                     e.keyCode === 77;
      
      // Don't toggle if user is typing in modal
      if (isMKey && !isWishModalOpen) {
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isWishModalOpen]);

  // Initialize and play background music
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(songAudio);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5; // 50% volume
      
      // Try to play automatically (may require user interaction in some browsers)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Audio autoplay prevented:', error);
          // Will play after user interaction
        });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Play music after user interaction (when pointer lock is activated)
  useEffect(() => {
    if (isLocked && audioRef.current && audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Could not play audio:', error);
        });
      }
    }
  }, [isLocked]);

  // Handle wish submission
  const handleWishSubmit = (wish: string) => {
    console.log('Wish submitted:', wish);
    // Trigger candle blowing animation
    const blowEvent = new CustomEvent('blowCandles');
    window.dispatchEvent(blowEvent);
    
    // Mark candles as blown out and restore lighting
    setTimeout(() => {
      setCandlesBlownOut(true);
      setShowWishButton(false);
      console.log('💡 Restoring room lighting...');
    }, 3500); // بعد انتهاء النفخ (3 ثواني) + وقت الأنيميشن
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div 
      className="relative w-full h-screen"
      style={{ cursor: isLocked && !isWishModalOpen ? 'none' : 'auto' }}
    >
      <Canvas
        camera={{ position: [0, 2.2, 8], fov: 60 }}
        className="bg-gradient-to-b from-slate-900 via-indigo-900 to-black"
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: false,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          {/* Night sky - dark blue gradient */}
          <Sky 
            sunPosition={[0, -100, 0]} 
            turbidity={3}
            rayleigh={0.5}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            inclination={0.49}
            azimuth={0.25}
          />
          {/* More stars for night effect */}
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          
          <fog attach="fog" args={["#1a1a2e", 15, 30]} />
          {/* Ambient light dims when close to cake, restores after blowing */}
          <ambientLight intensity={candlesBlownOut ? 0.5 : (distanceToCake < 2.5 ? 0.15 : 0.5)} />
          {/* Room lights dim when close to cake, restore after blowing */}
          <pointLight 
            position={[0, 3, 0]} 
            intensity={candlesBlownOut ? 1 : (distanceToCake < 2.5 ? 0.2 : 1)} 
            color="#ff69b4" 
            distance={12} 
          />
          <pointLight 
            position={[3, 2, 3]} 
            intensity={candlesBlownOut ? 0.5 : (distanceToCake < 2.5 ? 0.1 : 0.5)} 
            color="#ffd700" 
          />
          <pointLight 
            position={[-3, 2, -3]} 
            intensity={candlesBlownOut ? 0.5 : (distanceToCake < 2.5 ? 0.1 : 0.5)} 
            color="#ff1493" 
          />
          {/* Spotlight on the cake dims when close, restores after blowing */}
          <spotLight 
            position={[0, 4, -3]} 
            angle={0.5} 
            penumbra={0.5} 
            intensity={candlesBlownOut ? 0.8 : (distanceToCake < 2.5 ? 0.2 : 0.8)} 
            color="#ffffff"
            target-position={[0, 1, -3]}
            castShadow
          />
          
          <RoomContent />
          
          <PointerLockControls
            onLock={() => {
              setIsLocked(true);
              setHasEnteredOnce(true);
            }}
            onUnlock={() => {
              // Don't allow unlocking - player stays in game
              // setIsLocked(false);
            }}
            pointerSpeed={0.5}
          />
          <KeyboardControls 
            onDistanceChange={handleDistanceChange} 
            isModalOpen={isWishModalOpen}
          />
          <ObjectInteraction />
          <BreathEffect />
        </Suspense>
      </Canvas>
      
      <LoadingScreen />
      <Instructions isLocked={hasEnteredOnce} />
      
      {/* Music Control Button - Top Right Corner */}
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 bg-black/70 backdrop-blur-sm hover:bg-black/90 text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        style={{ cursor: 'pointer' }}
        aria-label={isMuted ? 'Unmute music' : 'Mute music'}
      >
        {isMuted ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
      
      {/* Crosshair in center of screen when locked and looking at bouquet */}
      {isLocked && <Crosshair visible={showCrosshair} />}
      
      {/* Object pickup hint - when looking at it */}
      {showCrosshair && !holdingObject && isLocked && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in">
          <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg text-white text-sm font-bold shadow-xl">
            {hoveredObjectType === 'bouquet' && '🌹 اضغط على الماوس لحمل الباقة'}
            {hoveredObjectType === 'frame' && '🖼️ اضغط على الماوس لحمل البرواز'}
          </div>
        </div>
      )}
      
      {/* Object holding instructions */}
      {holdingObject && isLocked && (
        <div className="fixed top-24 right-6 z-50 animate-fade-in">
          <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg text-white text-sm shadow-xl">
            {holdingObject.type === 'bouquet' && (
              <>اضغط <kbd className="bg-white/20 px-2 py-1 rounded mx-1 font-bold">G</kbd> لرمي الباقة</>
            )}
            {holdingObject.type === 'frame' && (
              <>اضغط <kbd className="bg-white/20 px-2 py-1 rounded mx-1 font-bold">G</kbd> لرمي البرواز</>
            )}
          </div>
        </div>
      )}
      
      {/* Wish Button - appears when close to cake */}
      {showWishButton && isLocked && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in pointer-events-auto" style={{ cursor: 'auto' }}>
          <div className="text-center">
            <button
              onClick={() => {
                const event = new CustomEvent('openWishModal');
                window.dispatchEvent(event);
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 flex items-center gap-3 mb-2"
              style={{ cursor: 'pointer' }}
            >
              <span className="text-2xl">🎂</span>
              <span className="text-xl">تمنى أمنية</span>
              <span className="text-2xl">✨</span>
            </button>
            <div className="text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
              اضغط <kbd className="bg-white/20 px-2 py-1 rounded mx-1 font-bold">X</kbd> للفتح
            </div>
          </div>
        </div>
      )}
      
      {/* Wish Modal */}
      <WishModal onWishSubmit={handleWishSubmit} />
    </div>
  );
};
