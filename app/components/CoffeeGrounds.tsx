"use client";

import { useTexture } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

type CoffeeGroundsProps = {
  coffeeRatio: number; // 0 = start, 1 = fully brewed
};

export default function CoffeeGrounds({ coffeeRatio }: CoffeeGroundsProps) {
  const texture = useTexture("/coffee-ground.webp");

  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 2);
  }, [texture]);

  const startColor = new THREE.Color("#ffd051"); // light brown
  const endColor = new THREE.Color("#1c0b03");   // dark brown

  // Clone startColor every render before lerp
  const color = startColor.clone().lerp(endColor, coffeeRatio);

  return (
    <mesh position={[0, 0.48, 0]}>
      <cylinderGeometry args={[0.36, 0.36, 0.2, 32]} />
      <meshStandardMaterial
        map={texture}
        color={color}
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  );
}
