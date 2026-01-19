"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

type SteamProps = {
  active: boolean;
};

export default function Steam({ active }: SteamProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const particleCount = 700; // increased for denser burst
  const texture = useLoader(THREE.TextureLoader, "/smoke.png");

  // Create geometry with positions
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 0.12;  // wider x spread
      positions[i * 3 + 1] = Math.random() * 0.25;          // varied starting y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.12;  // wider z spread
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!active) return;

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const yIndex = i * 3 + 1;
      pos[yIndex] += delta * 0.75; // rise speed

      // reset particle once it reaches top
      if (pos[yIndex] > 0.5 + Math.random() * 0.2) {
        pos[yIndex] = 0;
        pos[i * 3 + 0] = (Math.random() - 0.5) * 0.12;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef} position={[0, 0.92, 0]} geometry={geometry}>
      <pointsMaterial
        map={texture}
        size={0.06}
        transparent
        opacity={0.5}
        depthWrite={false}
        alphaTest={0.01}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
