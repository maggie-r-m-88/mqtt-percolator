"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type HexCoffeeSurfaceProps = {
  radius: number;
  y: number;
  active: boolean;
};

export default function HexCoffeeSurface({
  radius,
  y,
  active,
}: HexCoffeeSurfaceProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(radius, 6);
    geo.rotateX(-Math.PI / 2); // horizontal
    return geo;
  }, [radius]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !active) return;

    const t = clock.getElapsedTime();
    const pos = geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const wave =
        Math.sin(t * 1.5 + x * 8 + z * 8) * 0.002;

      pos.setY(i, wave);
    }

    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} position={[0, y, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color="#2a1409"
        roughness={0.15}
        metalness={0.05}
        transparent
        opacity={0.95}
        emissive="#1a0c06"
        emissiveIntensity={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
