"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type AnimatedWaterProps = {
  waterVolume: number | null;
  state: "heating" | "brewing" | "finished" | "idle" | null;
};

export default function AnimatedWater({ waterVolume, state }: AnimatedWaterProps) {
  
  const meshRef = useRef<THREE.Mesh>(null);

  // Water only animates if there's volume and not idle
  const isActive = waterVolume !== null && state !== "idle";

  // Compute water ratio and geometry
  const waterRatio = waterVolume !== null ? Math.max(0, Math.min(1, waterVolume / 100)) : 0;

  const WATER_HEIGHT_MIN = 0.0;
  const WATER_HEIGHT_MAX = 0.57;
  const WATER_Y_START = -0.02;
  const WATER_Y_END = -0.32;

  const waterHeight = WATER_HEIGHT_MIN + waterRatio * (WATER_HEIGHT_MAX - WATER_HEIGHT_MIN);
  const waterY = WATER_Y_END + waterRatio * (WATER_Y_START - WATER_Y_END);

  const meshColor = ( state == "finished") ? "#333" : "#8fd3ff";

  // Subtle animated "sloshing" effect
  useFrame((stateFrame) => {
    if (!meshRef.current || !isActive) return;

    const time = stateFrame.clock.getElapsedTime();
    meshRef.current.position.y = waterY + Math.sin(time * 1.0) * 0.005; // slower movement
  });

  if (!isActive) return null;

  return (
    <mesh ref={meshRef} position={[0, waterY, 0]}>
      <cylinderGeometry args={[0.41, 0.47, waterHeight, 32]} />
      <meshStandardMaterial
        color={meshColor}
        //transparent
        opacity={0.65}
        roughness={0.05}
        metalness={0.1}
        envMapIntensity={1}
      />
    </mesh>
  );
}
