"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { Water } from "three-stdlib";
import { TextureLoader } from "three";

// Extend three-fiber so <water /> works
extend({ Water });

// --- TypeScript fix for <water /> JSX ---
declare global {
  namespace JSX {
    interface IntrinsicElements {
      water: any;
    }
  }
}

type AnimatedWaterProps = {
  waterVolume: number | null;
  state: "heating" | "brewing" | "finished" | "idle" | null;
};

export default function AnimatedWater({ waterVolume, state }: AnimatedWaterProps) {
  const waterRef = useRef<any>(null);
  const gl = useThree((s) => s.gl);

  const isActive = waterVolume !== null && state !== "idle";

  // Water ratio for height
  const waterRatio = waterVolume !== null ? Math.max(0, Math.min(1, waterVolume / 100)) : 0;
  const WATER_HEIGHT_MIN = 0.0;
  const WATER_HEIGHT_MAX = 0.57;
  const WATER_Y_START = -0.02;
  const WATER_Y_END = -0.32;
  const waterHeight = WATER_HEIGHT_MIN + waterRatio * (WATER_HEIGHT_MAX - WATER_HEIGHT_MIN);
  const waterY = WATER_Y_END + waterRatio * (WATER_Y_START - WATER_Y_END);

  const waterColor = state === "finished" ? "#333333" : "#8fd3ff";

  // Water normals
  const waterNormals = useMemo(() => new TextureLoader().load("/waternormals.jpeg"), []);
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

  const waterConfig = useMemo(
    () => ({
      textureWidth: 256, // lower res is fine
      textureHeight: 256,
      waterNormals,
      sunDirection: new THREE.Vector3(0, 1, 0),
      sunColor: 0xffffff,
      waterColor: new THREE.Color(waterColor),
      distortionScale: 0.01, // subtle ripples
      fog: false,
      format: gl.encoding,
    }),
    [waterNormals, waterColor, gl]
  );

  // Animate water time slowly
  useFrame((state, delta) => {
    if (waterRef.current) {
      waterRef.current.material.uniforms.time.value += delta * 0.1; // slow down
    }
  });

  if (!isActive) return null;

  return (
    <group position={[0, waterY, 0]}>
      <water
        ref={waterRef}
        args={[new THREE.CylinderGeometry(0.41, 0.47, waterHeight, 32), waterConfig]}
      />
    </group>
  );
}
