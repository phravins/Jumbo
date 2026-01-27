import React, { useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';


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


  useFrame((state: any) => {
    if (boxRef.current && !isOpening) {
      boxRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      boxRef.current.position.y = hovered ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0;
    }


    if (ribbonRef.current && !isOpening) {
      ribbonRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  const handleClick = () => {

    if (isOpening) return;
    setIsOpening(true);



    if (ribbonRef.current) {


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


    if (boxRef.current) {


      gsap.to(boxRef.current.position, {
        x: 0.1,
        duration: 0.05,
        yoyo: true,
        repeat: 5
      });


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
      onClick={(e) => { e.stopPropagation(); handleClick(); }}
    >

      <mesh visible={false}>
        <boxGeometry args={[3, 3, 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>


      <mesh
        position={[0, 0, 0]}
      >
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial
          color="#1E90FF"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>


      <mesh
        ref={lidRef}
        position={[0, 0.9, 0]}
      >
        <boxGeometry args={[2.1, 0.3, 2.1]} />
        <meshStandardMaterial
          color="#4169E1"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>


      <group ref={ribbonRef}>

        <mesh
          position={[0, 0, 0]}
        >
          <boxGeometry args={[0.15, 1.8, 2.1]} />
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>


        <mesh
          position={[0, 0, 0]}
        >
          <boxGeometry args={[2.1, 1.8, 0.15]} />
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>


        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.8, 0.4, 0.4]} />
          <meshStandardMaterial
            color="#dc2626"
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>


        <mesh position={[-0.4, 1.2, 0]} rotation={[0, 0, Math.PI * 0.25]}>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh position={[0.4, 1.2, 0]} rotation={[0, 0, -Math.PI * 0.25]}>
          <boxGeometry args={[0.3, 0.3, 0.8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.2} metalness={0.3} />
        </mesh>
      </group>


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


function Scene({ onOpen }: GiftBox3DProps) {
  return (
    <>
      <color attach="background" args={['#ffc0cb']} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.6} color="#fff" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#FFD700" />

      <AnimatedGiftBox onOpen={onOpen} />


      <mesh
        position={[0, -2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();

        }}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#ffc0cb" roughness={0.8} />
      </mesh>


      <fog attach="fog" args={['#ffc0cb', 5, 20]} />
    </>
  );
}


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
          // style={{ pointerEvents: 'none' }} // REMOVED THIS: blocking events
          onCreated={({ gl }) => {
            if (!gl.getContext()) throw new Error("No WebGL Context");
          }}
        >
          <Scene onOpen={onOpen} />
        </Canvas>
      </WebGLErrorBoundary>

    </div>
  );
}
