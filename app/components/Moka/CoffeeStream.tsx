"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type CoffeeStreamProps = {
  position?: [number, number, number];
  brewing: boolean;
  coffeeRatio: number; // 0 = start of brewing (light), 1 = full espresso
};

type Drop = {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
};

export default function CoffeeStream({
  position = [0, 0, 0],
  brewing,
  coffeeRatio,
}: CoffeeStreamProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dropsRef = useRef<Drop[]>([]);

  const intensity = brewing ? Math.min(Math.max(coffeeRatio, 0.05), 0.4) : 0;

  // Colors
  const cremaColor = new THREE.Color("#caa472");
  const espressoColor = new THREE.Color("#2a1409");

  useFrame((_, delta) => {
    if (!groupRef.current || intensity <= 0) return;

    const streamHeight = 0.62;
    const bottomRadius = 0.03 * 2.5; // wider bottom
    const topRadius = 0.01 * 1.2;   // top radius

    const dropCount = Math.ceil(2 * intensity + dropsRef.current.length * 0.02);

    for (let i = 0; i < dropCount; i++) {

        const MAX_DROPS = 300; // tweak this
        if (dropsRef.current.length >= MAX_DROPS) break; // stop spawning more
      const length = 0.02 + Math.random() * 0.02;
      const geometry = new THREE.CylinderGeometry(0.003, 0.003, length, 6);

      // Interpolate color based on coffeeRatio
      const color = new THREE.Color().lerpColors(cremaColor, espressoColor, coffeeRatio);

      const material = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.4 + coffeeRatio * 0.5,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // -----------------------------
      // Y-position
      // -----------------------------
      let yOffset = Math.random() * streamHeight;
      const radiusAtY = bottomRadius + (topRadius - bottomRadius) * (yOffset / streamHeight);
      const theta = Math.random() * Math.PI * 2;
      const xOffset = radiusAtY * Math.cos(theta);
      const zOffset = radiusAtY * Math.sin(theta);
      yOffset = -streamHeight + yOffset;

      mesh.position.set(xOffset, yOffset, zOffset);
      mesh.rotation.x = Math.PI / 2;

      groupRef.current.add(mesh);

      dropsRef.current.push({
        mesh,
        velocity: new THREE.Vector3(
          0,
          0.05 + Math.random() * 0.02, // moving up
          0
        ),
        life: 1.1 + Math.random() * 0.5,
      });
    }

    // Update existing drops
    dropsRef.current.forEach((d, idx) => {
      d.mesh.position.addScaledVector(d.velocity, delta);
      d.life -= delta;

      // Keep color updated if coffeeRatio changes during brewing
      if (d.mesh.material instanceof THREE.MeshStandardMaterial) {
        d.mesh.material.color.lerpColors(cremaColor, espressoColor, coffeeRatio);
        d.mesh.material.opacity = Math.max(0, d.life);
      }

      if (d.life <= 0) {
        groupRef.current?.remove(d.mesh);
        dropsRef.current.splice(idx, 1);
      }
    });
  });

  if (!brewing || intensity <= 0) return null;

  return <group ref={groupRef} position={position} />;
}
