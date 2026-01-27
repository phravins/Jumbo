import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface Cake3DProps {
  onCut: () => void;
}

interface SliceData {
  id: number;
  angle: number;
  cut: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}


const CakeSlice = ({ data }: { data: SliceData }) => {
  const groupRef = useRef<THREE.Group>(null);


  const thetaLength = (Math.PI * 2) / 8;



  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
    >
      <group rotation={[0, 0, 0]}>



        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.4, 32, 1, false, 0, thetaLength]} />
          <meshStandardMaterial color="#F0E68C" />
        </mesh>


        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.05, 32, 1, false, 0, thetaLength]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>


        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.35, 32, 1, false, 0, thetaLength]} />
          <meshStandardMaterial color="#F0E68C" />
        </mesh>


        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.1, 32, 1, false, 0, thetaLength]} />
          <meshStandardMaterial color="#FF69B4" roughness={0.5} />
        </mesh>


        <group position={[0, 0.65, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.3, 32, 1, false, 0, thetaLength]} />
            <meshStandardMaterial color="#F0E68C" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.05, 32, 1, false, 0, thetaLength]} />
            <meshStandardMaterial color="#FF69B4" />
          </mesh>
        </group>


        <group position={[0, 1.0, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.2, 32, 1, false, 0, thetaLength]} />
            <meshStandardMaterial color="#F0E68C" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.05, 32, 1, false, 0, thetaLength]} />
            <meshStandardMaterial color="#FF69B4" />
          </mesh>

          <group position={[
            Math.cos(thetaLength / 2) * 0.4,
            0.25,
            Math.sin(thetaLength / 2) * 0.4
          ]}>
            <Cylinder args={[0.03, 0.03, 0.2, 8]}>
              <meshStandardMaterial color="#FFF" />
            </Cylinder>

            <mesh position={[0, 0.15, 0]}>
              <sphereGeometry args={[0.04]} />
              <meshBasicMaterial color="#FFA500" />
            </mesh>
          </group>
        </group>


        <mesh position={[Math.cos(thetaLength / 2) * 1.2, 0.6, Math.sin(thetaLength / 2) * 1.2]}>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color={data.id % 2 === 0 ? "#00FFFF" : "#FFFF00"} />
        </mesh>

      </group>
    </group>
  );
};


const Knife = React.forwardRef<THREE.Group, any>((props, ref) => {
  return (
    <group ref={ref} {...props}>

      <Box args={[0.2, 1.2, 0.15]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </Box>


      <Box args={[0.4, 0.1, 0.15]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#E0E0E0" metalness={0.9} roughness={0.2} />
      </Box>


      <group position={[0, -0.6, 0]}>

        <Box args={[0.15, 1.5, 0.02]}>
          <meshStandardMaterial color="#F5F5F5" metalness={1} roughness={0.1} />
        </Box>

        <mesh position={[0.08, 0, 0]} rotation={[0, 0, 0]}>
          <Box args={[0.05, 1.5, 0.01]} />
          <meshStandardMaterial color="#FFFFFF" metalness={1} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
});

function AnimatedCake({ onCut }: Cake3DProps) {
  const knifeRef = useRef<THREE.Group>(null);
  const [isCutting, setIsCutting] = useState(false);
  const [slices, setSlices] = useState<SliceData[]>([]);
  const [cutCount, setCutCount] = useState(0);


  useEffect(() => {
    const initialSlices: SliceData[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      initialSlices.push({
        id: i,
        angle,
        cut: false,
        position: [0, 0, 0],
        rotation: [0, angle, 0]
      });
    }
    setSlices(initialSlices);
  }, []);


  useFrame((state: any) => {
    if (knifeRef.current && !isCutting) {
      knifeRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      knifeRef.current.rotation.z = Math.PI + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const handleCut = () => {
    if (isCutting || cutCount >= 8) return;

    setIsCutting(true);
    setCutCount(prev => prev + 1);


    if (knifeRef.current) {

      const targetSliceIndex = cutCount % 8;
      const targetAngle = slices[targetSliceIndex].angle;


      gsap.to(knifeRef.current.position, {
        x: Math.cos(targetAngle + Math.PI / 8) * 1.5, // Offset slightly
        z: Math.sin(targetAngle + Math.PI / 8) * 1.5,
        duration: 0.5,
        ease: 'power2.out'
      });


      gsap.to(knifeRef.current.rotation, {
        y: -targetAngle,
        duration: 0.5
      });


      gsap.to(knifeRef.current.position, {
        y: 0.5,
        duration: 0.3,
        delay: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          // Slice floats away
          setSlices(prev => prev.map((slice, index) => {
            if (index === targetSliceIndex) {
              const extractDir = slice.angle + (Math.PI / 8);
              return {
                ...slice,
                cut: true,

                position: [
                  Math.cos(extractDir) * 1.5,
                  0,
                  Math.sin(extractDir) * 1.5
                ],
              };
            }
            return slice;
          }));

          onCut();


          gsap.to(knifeRef.current!.position, {
            y: 2,
            duration: 0.5,
            ease: 'back.out',
            onComplete: () => setIsCutting(false)
          });
        }
      });
    }
  };

  return (
    <group>

      <Cylinder args={[1.5, 1.6, 0.2, 32]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#8B4513" roughness={0.5} />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 1.0, 16]} position={[0, -0.6, 0]}>
        <meshStandardMaterial color="#4A3423" />
      </Cylinder>


      <group position={[0, 0.2, 0]} onClick={(e) => { e.stopPropagation(); handleCut(); }}>

        <mesh visible={false}>
          <cylinderGeometry args={[1.5, 1.5, 2, 16]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {slices.map((slice) => (
          <CakeSlice key={slice.id} data={slice} />
        ))}
      </group>


      <Knife ref={knifeRef} position={[2, 2, 0]} rotation={[0, 0, Math.PI]} />


      <mesh position={[0, -2, 0]}>
        <planeGeometry args={[4, 0.5]} />
        <meshBasicMaterial color="#333" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Scene({ onCut }: Cake3DProps) {
  return (
    <>
      <color attach="background" args={['#ffc0cb']} />
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#FFF" />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#FFB6C1" />

      <AnimatedCake onCut={onCut} />


      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#ffc0cb" roughness={1} />
      </mesh>

      <fog attach="fog" args={['#ffc0cb', 10, 40]} />
    </>
  );
}


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
          camera={{ position: [0, 4, 7], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }: any) => {
            if (!gl.getContext()) throw new Error("No WebGL Context");
          }}
        >
          <Scene onCut={onCut} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
