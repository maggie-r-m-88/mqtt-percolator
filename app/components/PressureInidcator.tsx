"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type PressureRingsProps = {
  radius?: number;
  segments?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  pressure?: number; // 0 → 2 bar (or whatever max you use)
  maxPressure?: number; // optional, default = 2
};

export default function PressureRings({
  radius = 0.1,
  segments = 3,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  pressure = 0,
  maxPressure = 2,
}: PressureRingsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const rings = useMemo(() => {
    return Array.from({ length: segments }).map((_, i) => {
      const geo = new THREE.RingGeometry(
        radius + i * 0.02,      // inner radius
        radius + i * 0.025,     // outer radius
        64,                     // radial segments
        1,                      // tubular segments
        0,                      // thetaStart → 0
        Math.PI * 2             // thetaLength → full circle
      );
      geo.rotateX(Math.PI / 2); // horizontal
      return geo;
    });
  }, [radius, segments]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const elapsed = clock.getElapsedTime();

    // Map pressure to pulse intensity (0.5 → subtle, 1.5 → strong)
    const normalizedPressure = Math.min(Math.max(pressure / maxPressure, 0), 1);
    const pulseScale = 0.5 + normalizedPressure; // min 0.5, max 1.5
    const pulseOpacity = 0.2 + normalizedPressure * 0.5; // min 0.2, max 0.7

    groupRef.current.children.forEach((child, i) => {
      const offset = i * 0.5;
      const pulse = Math.sin(elapsed * 2 + offset) * 0.25 + 1;

      child.scale.set(pulse * pulseScale, 1, pulse * pulseScale);
      (child.material as THREE.MeshBasicMaterial).opacity = pulseOpacity * Math.sin(elapsed * 2 + offset) ** 2;
    });
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {rings.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
