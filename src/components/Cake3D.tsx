import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface Cake3DProps {
  onCut: () => void;
}

interface SlicePiece {
  id: number;
  angle: number;
  cut: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}

function AnimatedCake({ onCut }: Cake3DProps) {
  const cakeRef = useRef<THREE.Group>(null);
  const knifeRef = useRef<THREE.Group>(null);
  const [isCutting, setIsCutting] = useState(false);
  const [slices, setSlices] = useState<SlicePiece[]>([]);
  const [cutCount, setCutCount] = useState(0);

  // Initialize 8 cake slices
  useEffect(() => {
    const initialSlices: SlicePiece[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      initialSlices.push({
        id: i,
        angle,
        cut: false,
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      });
    }
    setSlices(initialSlices);
  }, []);

  // Hover animation
  useFrame((state: any) => {
    if (cakeRef.current && !isCutting) {
      cakeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }

    // Knife floating animation
    if (knifeRef.current && !isCutting) {
      knifeRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      knifeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  const handleCut = () => {
    if (isCutting || cutCount >= 8) return;

    setIsCutting(true);
    setCutCount(prev => prev + 1);

    // Animate knife cutting down
    const knifePos = knifeRef.current?.position;
    const knifeRot = knifeRef.current?.rotation;

    if (knifePos && knifeRot) {
      // Knife cuts down
      gsap.to(knifePos, {
        y: 0.3,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          // Remove slice from cake
          setSlices(prev => prev.map((slice, index) => {
            if (index === cutCount % 8) {
              return {
                ...slice,
                cut: true,
                position: [
                  Math.cos(slice.angle) * 0.8,
                  -0.5,
                  Math.sin(slice.angle) * 0.8
                ],
                rotation: [0, slice.angle, Math.PI * 0.1]
              };
            }
            return slice;
          }));

          // Reset knife position
          gsap.to(knifePos, {
            y: 1.5,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => setIsCutting(false)
          });

          // Trigger confetti
          onCut();
        }
      });

      gsap.to(knifeRot, {
        x: Math.PI * 0.2,
        duration: 0.3
      });
    }
  };

  return (
    <group>
      {/* Cake Stand */}
      <Cylinder args={[1.5, 1.8, 0.1, 32]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.1} />
      </Cylinder>
      <Cylinder args={[0.3, 0.3, 0.8, 16]} position={[0, -1.2, 0]}>
        <meshStandardMaterial color="#654321" roughness={0.8} />
      </Cylinder>

      {/* Main Cake Group */}
      <group ref={cakeRef} onClick={handleCut}>
        {/* Cake Base - Bottom Layer */}
        <Cylinder
          args={[1.2, 1.2, 0.4, 32]}
          position={[0, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color="#F5DEB3" roughness={0.7} />
        </Cylinder>

        {/* Frosting Layer */}
        <Cylinder
          args={[1.15, 1.2, 0.1, 32]}
          position={[0, 0.25, 0]}
        >
          <meshStandardMaterial color="#FFF8DC" roughness={0.6} />
        </Cylinder>

        {/* Middle Layer */}
        <Cylinder
          args={[0.9, 0.9, 0.3, 32]}
          position={[0, 0.5, 0]}
          castShadow
        >
          <meshStandardMaterial color="#F5DEB3" roughness={0.7} />
        </Cylinder>

        {/* Middle Frosting */}
        <Cylinder
          args={[0.85, 0.9, 0.08, 32]}
          position={[0, 0.7, 0]}
        >
          <meshStandardMaterial color="#FFF8DC" roughness={0.6} />
        </Cylinder>

        {/* Top Layer */}
        <Cylinder
          args={[0.6, 0.6, 0.25, 32]}
          position={[0, 0.9, 0]}
          castShadow
        >
          <meshStandardMaterial color="#F5DEB3" roughness={0.7} />
        </Cylinder>

        {/* Top Frosting */}
        <Cylinder
          args={[0.55, 0.6, 0.05, 32]}
          position={[0, 1.05, 0]}
        >
          <meshStandardMaterial color="#FFF8DC" roughness={0.6} />
        </Cylinder>

        {/* Decorative Swirls on sides */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 1.2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                0.25,
                Math.sin(angle) * radius
              ]}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#FFB6C1" roughness={0.4} />
            </mesh>
          );
        })}

        {/* Candles */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2 - Math.PI * 0.5;
          const radius = 0.35;
          return (
            <group key={i} position={[
              Math.cos(angle) * radius,
              1.15,
              Math.sin(angle) * radius
            ]}>
              {/* Candle */}
              <Cylinder args={[0.03, 0.03, 0.15, 8]}>
                <meshStandardMaterial color="#FFF" roughness={0.3} />
              </Cylinder>
              {/* Flame */}
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial
                  color="#FFA500"
                />
              </mesh>
            </group>
          );
        })}

        {/* Birthday Text on Top */}
        <mesh position={[0, 1.2, 0]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#FF69B4" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Cut Cake Slices */}
      {slices.map((slice) => slice.cut && (
        <group
          key={slice.id}
          position={slice.position}
          rotation={slice.rotation}
        >
          {/* Slice geometry */}
          <mesh castShadow>
            <cylinderGeometry
              args={[0.5, 0.5, 0.8, 32, 1, false, slice.angle, Math.PI * 0.25]}
            />
            <meshStandardMaterial color="#F5DEB3" roughness={0.7} />
          </mesh>
          {/* Frosting on slice */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry
              args={[0.48, 0.5, 0.05, 32, 1, false, slice.angle, Math.PI * 0.25]}
            />
            <meshStandardMaterial color="#FFF8DC" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Cutting Knife */}
      <group
        ref={knifeRef}
        position={[2, 1.5, 0]}
        rotation={[0, 0, -Math.PI * 0.1]}
      >
        {/* Knife Handle */}
        <Box args={[0.15, 0.8, 0.1]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </Box>
        {/* Knife Guard */}
        <Box args={[0.25, 0.05, 0.05]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Knife Blade */}
        <Box args={[0.08, 0.6, 0.02]} position={[0, -0.35, 0]}>
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.9}
            roughness={0.1}
          />
        </Box>
      </group>

      {/* Instructions */}
      <mesh position={[0, -2, 0]}>
        <planeGeometry args={[3, 0.3]} />
        <meshBasicMaterial color="#333" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Scene({ onCut }: Cake3DProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFA500" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#FFB6C1" />

      <AnimatedCake onCut={onCut} />

      {/* Environment */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.8} />
      </mesh>

      <fog attach="fog" args={['#f5f5f5', 10, 50]} />
    </>
  );
}

// Basic Error Boundary to catch WebGL crashes
class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("WebGL Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Helper to detect WebGL support before crashing
const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

export default function Cake3D({ onCut }: Cake3DProps) {
  const webGLSupported = isWebGLAvailable();

  if (!webGLSupported) {
    return (
      <div
        onClick={() => onCut()}
        style={{
          width: '100vw',
          height: '100vh',
          background: '#ffc0cb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div style={{ fontSize: '100px', marginBottom: '20px' }}>🎂</div>
        <h2 style={{ color: '#d63384', fontFamily: 'sans-serif' }}>Tap to Cut the Cake!</h2>
        <p style={{ color: '#555', marginTop: '10px' }}>(2D Mode)</p>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5,
            cursor: 'pointer'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', cursor: 'pointer', position: 'relative' }}>
      <WebGLErrorBoundary
        fallback={
          <div
            onClick={() => onCut()}
            style={{
              width: '100%',
              height: '100%',
              background: '#ffc0cb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎂</div>
            <h2 style={{ color: '#d63384' }}>Tap to Cut!</h2>
            <p style={{ color: '#555', marginTop: '10px' }}>(3D Disabled)</p>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 3, 8], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }: any) => {
            if (!gl.getContext()) throw new Error("No WebGL Context");
          }}
        >
          <Scene onCut={onCut} />
        </Canvas>
      </WebGLErrorBoundary>
      {/* Fallback Interaction Layer */}
      <div
        onClick={() => onCut()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
          cursor: 'pointer'
        }}
        title="Tap to cut!"
      />
    </div>
  );
}

// Simple GSAP-like animation helper
const gsap = {
  to: (target: any, props: any) => {
    const {
      duration = 1,
      ease = 'linear',
      onComplete,
      yoyo = false,
      repeat = 0,
      delay = 0,
      ...animProps
    } = props;

    const startValues: any = {};

    // Store start values
    Object.keys(animProps).forEach(key => {
      if (target[key] !== undefined) {
        startValues[key] = target[key];
      }
    });

    const startAnimation = () => {
      let startTime = Date.now();
      let repeatCount = 0;
      let isReversing = false;

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        let progress = Math.min(elapsed / duration, 1);

        // Apply easing (simple power2 approximation)
        if (ease.includes('power2')) {
          progress = ease.includes('in') ? progress * progress : 1 - Math.pow(1 - progress, 2);
        }

        // Reverse progress if yoyo and reversing
        const animProgress = (yoyo && isReversing) ? 1 - progress : progress;

        // Simple linear interpolation
        Object.keys(animProps).forEach(key => {
          if (target[key] !== undefined) {
            const start = startValues[key] || 0;
            const end = animProps[key];
            target[key] = start + (end - start) * animProgress;
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (yoyo && repeatCount < repeat) {
          // Toggle direction for yoyo
          isReversing = !isReversing;
          if (isReversing) {
            repeatCount++;
          }
          startTime = Date.now();
          requestAnimationFrame(animate);
        } else if (onComplete) {
          onComplete();
        }
      };

      requestAnimationFrame(animate);
    };

    // Handle delay
    if (delay > 0) {
      setTimeout(startAnimation, delay * 1000);
    } else {
      startAnimation();
    }
  }
};
