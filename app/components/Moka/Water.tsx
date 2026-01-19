"use client";

import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";
import { Water } from "three-stdlib";
import { TextureLoader } from "three";

extend({ Water });

declare module '@react-three/fiber' {
  interface ThreeElements {
    water: any;
  }
}

type AnimatedWaterProps = {
  waterVolume: number | null;
  state: "heating" | "brewing" | "finished" | "idle" | null;
};

type Bubble = {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
};

export default function AnimatedWater({ waterVolume, state }: AnimatedWaterProps) {
  const waterRef = useRef<any>(null);

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

  // Water normals texture
  const waterNormals = useMemo(() => new TextureLoader().load("/waternormals.jpeg"), []);
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

  const waterConfig = useMemo(
    () => ({
      textureWidth: 256,
      textureHeight: 256,
      waterNormals,
      sunDirection: new THREE.Vector3(0, 1, 0),
      sunColor: 0xffffff,
      waterColor: new THREE.Color(waterColor),
      distortionScale: 0.01,
      fog: false,
    }),
    [waterNormals, waterColor]
  );

  // Bubble refs
  const groupRef = useRef<THREE.Group>(null);
  const bubblesRef = useRef<Bubble[]>([]);

  useFrame((_, delta) => {
    if (waterRef.current) {
      waterRef.current.material.uniforms.time.value += delta * 0.05;
    }

    // Only generate bubbles while heating/brewing
    if (state === "heating" || state === "brewing") {
      const bubbleCount = 2 + Math.floor(waterRatio * 5); // more water → more bubbles
      for (let i = 0; i < bubbleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.01 + Math.random() * 0.01, 8, 8);
        const material = new THREE.MeshStandardMaterial({
          color: "#fff",
          transparent: true,
          opacity: 0.5 + Math.random() * 0.3,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Spawn slightly random in water
        const radius = 0.41;
        const x = (Math.random() - 0.5) * radius * 1.5;
        const z = (Math.random() - 0.5) * radius * 1.5;
        mesh.position.set(x, -waterHeight / 2 + Math.random() * 0.1, z);

        groupRef.current?.add(mesh);

        bubblesRef.current.push({
          mesh,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.002,
            0.03 + Math.random() * 0.02,
            (Math.random() - 0.5) * 0.002
          ),
          life: 1 + Math.random() * 0.5,
        });
      }
    }

    // Update existing bubbles
    bubblesRef.current.forEach((b, idx) => {
      b.mesh.position.addScaledVector(b.velocity, delta);
      b.life -= delta;

      if (b.mesh.material instanceof THREE.MeshStandardMaterial) {
        b.mesh.material.opacity = Math.max(0, b.life); // fade out
      }

      if (b.life <= 0) {
        groupRef.current?.remove(b.mesh);
        bubblesRef.current.splice(idx, 1);
      }
    });
  });

  if (!isActive) return null;

  return (
    <group position={[0, waterY, 0]} ref={groupRef}>
      <water
        ref={waterRef}
        args={[new THREE.CylinderGeometry(0.41, 0.47, waterHeight, 32), waterConfig]}
      />
    </group>
  );
}