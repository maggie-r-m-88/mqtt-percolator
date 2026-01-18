"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import CoffeeSurface from "./CoffeeSurface";

type FinishedCoffeeProps = {
  coffeeVolume: number | null;
  state: "heating" | "brewing" | "finished" | "idle" | null;
};

export default function FinishedCoffee({ coffeeVolume, state }: FinishedCoffeeProps) {
  if (coffeeVolume === null || state === "idle") return null;

  const coffeeRatio = Math.min(Math.max(coffeeVolume / 100, 0), 1);

  const COFFEE_BOTTOM_Y = 0.56;
  const MAX_HEIGHT = 0.61;
  const BASE_RADIUS = 0.44;

  const height = 0.01 + coffeeRatio * (MAX_HEIGHT - 0.01);
  const centerY = COFFEE_BOTTOM_Y + height / 2;
  const surfaceY = COFFEE_BOTTOM_Y + height;

  const color = new THREE.Color().lerpColors(
    new THREE.Color("#caa472"), // crema
    new THREE.Color("#2a1409"), // espresso
    coffeeRatio
  );

  const meshRef = useRef<THREE.Mesh>(null);
  const wobbleRef = useRef(0);

  useFrame((state, delta) => {
    // subtle vertical wobble
    if (meshRef.current) {
      wobbleRef.current += delta;
      meshRef.current.position.y = centerY + Math.sin(wobbleRef.current * 2) * coffeeRatio * 0.002;
    }
  });

  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Coffee volume */}
      <mesh ref={meshRef} position={[0, centerY, 0]}>
        <cylinderGeometry args={[BASE_RADIUS, BASE_RADIUS, height, 8]} />
        <meshStandardMaterial
          color={color}
          opacity={0.92}
          roughness={0.35}
          metalness={0.05}
          flatShading
        />
      </mesh>

      {/* Coffee surface */}
      <CoffeeSurface
        radius={BASE_RADIUS * 0.87}
        y={surfaceY}
        active={state === "finished"}
      />
    </group>
  );
}
