import { useEffect, useRef, useState } from 'react';

interface IcosahedronProps {
  size?: number;
  className?: string;
  strokeColor?: string;
  accentVertices?: boolean;
}

export default function WireframeIcosahedron({
  size = 200,
  className = '',
  strokeColor = '#F5F5F5',
  accentVertices = true,
}: IcosahedronProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ rx: 0.4, ry: 0.6, rz: 0.2 });

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animId: number;
    let lastTime = performance.now();
    // Rotation speed under 0.2 rad/s (approx 0.12 rad/s)
    const speed = 0.12;

    const tick = (now: number) => {
      // Pause when tab is hidden
      if (!document.hidden) {
        const deltaSec = (now - lastTime) / 1000;
        setRotation((prev) => ({
          rx: prev.rx + deltaSec * speed * 0.7,
          ry: prev.ry + deltaSec * speed,
          rz: prev.rz + deltaSec * speed * 0.3,
        }));
      }
      lastTime = now;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Standard regular icosahedron geometry
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ~1.61803398875
  const rawVertices: [number, number, number][] = [
    [-1,  phi, 0],
    [ 1,  phi, 0],
    [-1, -phi, 0],
    [ 1, -phi, 0],
    [0, -1,  phi],
    [0,  1,  phi],
    [0, -1, -phi],
    [0,  1, -phi],
    [ phi, 0, -1],
    [ phi, 0,  1],
    [-phi, 0, -1],
    [-phi, 0,  1],
  ];

  // 30 Edges of an icosahedron connecting adjacent vertices (distance == 2)
  const edges: [number, number][] = [
    [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
    [1, 5], [1, 7], [1, 8], [1, 9],
    [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
    [3, 4], [3, 6], [3, 8], [3, 9],
    [4, 5], [4, 9], [4, 11],
    [5, 9], [5, 11],
    [6, 7], [6, 8], [6, 10],
    [7, 8], [7, 10],
    [8, 9],
    [10, 11]
  ];

  // 3D rotation matrix calculation
  const cosX = Math.cos(rotation.rx), sinX = Math.sin(rotation.rx);
  const cosY = Math.cos(rotation.ry), sinY = Math.sin(rotation.ry);
  const cosZ = Math.cos(rotation.rz), sinZ = Math.sin(rotation.rz);

  const scale = size * 0.28;
  const cx = size / 2;
  const cy = size / 2;
  const fov = 4.5;

  const projectedVertices = rawVertices.map(([x, y, z]) => {
    // Rotate Y
    let x1 = x * cosY + z * sinY;
    let y1 = y;
    let z1 = -x * sinY + z * cosY;

    // Rotate X
    let x2 = x1;
    let y2 = y1 * cosX - z1 * sinX;
    let z2 = y1 * sinX + z1 * cosX;

    // Rotate Z
    let x3 = x2 * cosZ - y2 * sinZ;
    let y3 = x2 * sinZ + y2 * cosZ;
    let z3 = z2;

    // Perspective projection
    const pz = z3 + fov;
    const projScale = (scale * fov) / pz;
    return {
      x: cx + x3 * projScale,
      y: cy + y3 * projScale,
      z: z3,
    };
  });

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Wireframe 30 edges */}
        {edges.map(([i, j], edgeIdx) => {
          const v1 = projectedVertices[i];
          const v2 = projectedVertices[j];
          const avgZ = (v1.z + v2.z) / 2;
          // Depth fading: deeper edges are grayer, closer edges are brighter
          const opacity = Math.max(0.2, Math.min(0.9, (avgZ + phi) / (2 * phi)));
          return (
            <line
              key={edgeIdx}
              x1={v1.x}
              y1={v1.y}
              x2={v2.x}
              y2={v2.y}
              stroke={strokeColor}
              strokeWidth="1.2"
              strokeOpacity={opacity}
              strokeLinecap="round"
            />
          );
        })}

        {/* Vertices */}
        {accentVertices &&
          projectedVertices.map((v, vIdx) => (
            <circle
              key={vIdx}
              cx={v.x}
              cy={v.y}
              r={v.z > 0 ? "2.2" : "1.5"}
              fill={v.z > 0 ? "#D4FF3A" : "#8A8A8A"}
              opacity={v.z > 0 ? 0.9 : 0.4}
            />
          ))}
      </svg>
    </div>
  );
}
