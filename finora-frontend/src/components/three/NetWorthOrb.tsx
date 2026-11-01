import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbMeshProps {
  trendPositive: boolean;
}

function OrbMesh({ trendPositive }: OrbMeshProps) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  // Calmer swirl when flat/negative, livelier when trending up — ties the
  // orb's motion to the actual net-worth trend rather than being decorative.
  const baseSpeed = trendPositive ? 0.006 : 0.002;

  useFrame(() => {
    if (outerRef.current) {
      outerRef.current.rotation.y += baseSpeed + pointer.x * 0.004;
      outerRef.current.rotation.x += baseSpeed * 0.4 + pointer.y * 0.004;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= baseSpeed * 1.3;
      innerRef.current.rotation.x -= baseSpeed * 0.6;
    }
  });

  const outerGeo = useMemo(() => new THREE.IcosahedronGeometry(1.3, 2), []);
  const innerGeo = useMemo(() => new THREE.IcosahedronGeometry(0.55, 1), []);

  return (
    <>
      <mesh ref={outerRef} geometry={outerGeo}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.85} />
      </mesh>
      <mesh ref={innerRef} geometry={innerGeo}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
      </mesh>
    </>
  );
}

interface NetWorthOrbProps {
  trendPositive?: boolean;
  className?: string;
}

export default function NetWorthOrb({ trendPositive = true, className }: NetWorthOrbProps) {
  return (
    <div className={className} style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 3.6], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <OrbMesh trendPositive={trendPositive} />
      </Canvas>
    </div>
  );
}
