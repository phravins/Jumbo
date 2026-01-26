import React, { useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';

import * as THREE from 'three';

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

interface GiftBox3DProps {
  onOpen: () => void;
}

function AnimatedGiftBox({ onOpen }: GiftBox3DProps) {
  const boxRef = useRef<THREE.Group>(null);
  const ribbonRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Hover animation
  useFrame((state: any) => {
    if (boxRef.current && !isOpening) {
      boxRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      boxRef.current.position.y = hovered ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0;
    }

    // Ribbon floating animation
    if (ribbonRef.current && !isOpening) {
      ribbonRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  const handleClick = () => {

    if (isOpening) return;
    setIsOpening(true);


    // Animate ribbon unwrapping
    if (ribbonRef.current) {

      // Ribbon falls away
      gsap.to(ribbonRef.current.position, {
        y: -3,
        duration: 0.8,
        ease: 'power2.in'
      });
      gsap.to(ribbonRef.current.rotation, {
        x: Math.PI * 2,
        y: Math.PI,
        duration: 1,
        ease: 'power2.out',
        delay: 0.4
      });
      gsap.to(ribbonRef.current.scale, {
        x: 0.1,
        y: 0.1,
        z: 0.1,
        duration: 0.5,
        delay: 0.5
      });
    }

    // Box shakes then opens
    if (boxRef.current) {

      // Shake effect
      gsap.to(boxRef.current.position, {
        x: 0.1,
        duration: 0.05,
        yoyo: true,
        repeat: 5
      });

      // Lid pops open
      if (lidRef.current) {
        gsap.to(lidRef.current.position, {
          y: 2,
          duration: 0.4,
          ease: 'power2.out',
          delay: 0.3
        });
        gsap.to(lidRef.current.rotation, {
          x: Math.PI * 0.3,
          duration: 0.5,
          ease: 'back.out(1.7)',
          delay: 0.5
        });
      }

      // Box glows and fades
      gsap.to(boxRef.current.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 0.5,
        delay: 0.8,
        onComplete: () => {

          setTimeout(onOpen, 500);
        }
      });
    }
  };

  return (
    <group
      ref={boxRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Gift Box Base */}
      {/* Gift Box Base */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Gift Box Lid */}
      <mesh
        ref={lidRef}
        position={[0, 0.9, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <boxGeometry args={[2.1, 0.3, 2.1]} />
        <meshStandardMaterial
          color="#0f0f1e"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Vertical Ribbon */}
      <group ref={ribbonRef}>
        {/* Front ribbon */}
        <mesh
          position={[0, 0, 0]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <boxGeometry args={[0.15, 1.8, 2.1]} />
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* Side ribbons */}
        <mesh
          position={[0, 0, 0]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <boxGeometry args={[2.1, 1.8, 0.15]} />
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* Ribbon Bow - Top */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.8, 0.4, 0.4]} />
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* Bow loops */}
        <mesh position={[-0.4, 1.2, 0]} rotation={[0, 0, Math.PI * 0.25]}>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh position={[0.4, 1.2, 0]} rotation={[0, 0, -Math.PI * 0.25]}>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.2} metalness={0.3} />
        </mesh>
      </group>

      {/* Sparkle effects */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i / 8) * Math.PI * 2) * 3,
            Math.cos((i / 8) * Math.PI * 2) * 0.5 + 1,
            Math.cos((i / 8) * Math.PI * 2) * 3
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color="#FFD700"
          />
        </mesh>
      ))}
    </group>
  );
}

// Scene lighting and environment
function Scene({ onOpen }: GiftBox3DProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#dc2626" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#FFD700" />

      <AnimatedGiftBox onOpen={onOpen} />

      {/* Ground plane */}
      <mesh
        position={[0, -2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Environment */}
      <fog attach="fog" args={['#0a0a0a', 5, 20]} />
    </>
  );
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

export default function GiftBox3D({ onOpen }: GiftBox3DProps) {
  const webGLSupported = isWebGLAvailable();

  if (!webGLSupported) {
    return (
      <div
        onClick={() => onOpen()}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          cursor: 'pointer',
          background: '#1a1a2e' // Match background
        }}
      >
        <div style={{ fontSize: '100px', marginBottom: '20px' }}>🎁</div>
        <h2 style={{ color: 'white', fontFamily: 'sans-serif' }}>Tap to Open!</h2>
        <p style={{ color: '#aaa', marginTop: '10px' }}>(2D Mode)</p>
        {/* Full screen click layer */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <WebGLErrorBoundary
        fallback={
          <div
            onClick={() => onOpen()}
            style={{
              width: '100%',
              height: '100%',
              background: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎁</div>
            <h2 style={{ color: 'white' }}>Tap to Open!</h2>
            <p style={{ color: '#aaa', marginTop: '10px' }}>(3D Disabled)</p>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 2, 6], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: false }}
          style={{ pointerEvents: 'none' }}
          onCreated={({ gl }) => {
            if (!gl.getContext()) throw new Error("No WebGL Context");
          }}
        >
          <Scene onOpen={onOpen} />
        </Canvas>
      </WebGLErrorBoundary>
      {/* Fallback Interaction Layer - Guarantees click works even if 3D fails completely */}
      <div
        onClick={() => onOpen()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
          cursor: 'pointer'
        }}
        title="Tap to open!"
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

    // Store start values (including nested objects)
    Object.keys(animProps).forEach(key => {
      if (target[key] !== undefined) {
        if (typeof target[key] === 'object' && target[key] !== null) {
          startValues[key] = {};
          Object.keys(animProps[key] || {}).forEach(subKey => {
            startValues[key][subKey] = target[key][subKey];
          });
        } else {
          startValues[key] = target[key];
        }
      }
    });

    const startAnimation = () => {
      let startTime = Date.now();
      let repeatCount = 0;
      let isReversing = false;

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        let progress = Math.min(elapsed / duration, 1);

        // Apply easing
        if (ease.includes('power2')) {
          if (ease.includes('in')) {
            progress = progress * progress;
          } else if (ease.includes('out')) {
            progress = 1 - Math.pow(1 - progress, 2);
          }
        } else if (ease.includes('back')) {
          // Simple back easing approximation
          const c1 = 1.70158;
          const c3 = c1 + 1;
          progress = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
        }

        // Reverse progress if yoyo and reversing
        const animProgress = (yoyo && isReversing) ? 1 - progress : progress;

        // Interpolate values
        Object.keys(animProps).forEach(key => {
          if (target[key] !== undefined && typeof target[key] === 'object' && target[key] !== null) {
            Object.keys(animProps[key] || {}).forEach(subKey => {
              const start = startValues[key]?.[subKey] || 0;
              const end = animProps[key][subKey];
              target[key][subKey] = start + (end - start) * animProgress;
            });
          } else if (target[key] !== undefined) {
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
