"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type CoffeeStreamProps = {
  position?: [number, number, number];
  brewing: boolean;
  coffeeRatio: number;
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

  useFrame((_, delta) => {
    if (!groupRef.current || intensity <= 0) return;

    const streamHeight = 0.62;

    // -----------------------------
    // Bottom radius increased more (35% wider), top radius stays same
    // -----------------------------
    const bottomRadius = 0.03 * 2.5; // bigger bottom
    const topRadius = 0.008 * 1.2;    // same as before

    const dropCount = Math.ceil(2 * intensity + dropsRef.current.length * 0.05);

    for (let i = 0; i < dropCount; i++) {
      const length = 0.02 + Math.random() * 0.02;
      const geometry = new THREE.CylinderGeometry(0.003, 0.003, length, 6);
      const material = new THREE.MeshStandardMaterial({
        color: "#4b2e0f",
        transparent: true,
        opacity: 0.4 + coffeeRatio * 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);

      // -----------------------------
      // Y-position
      // -----------------------------
      let yOffset = Math.random() * streamHeight; // 0 = bottom, streamHeight = top

      // Radius proportional to height (cone shape)
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
        life: 1.5 + Math.random() * 0.5,
      });
    }

    // Update existing drops
    dropsRef.current.forEach((d, idx) => {
      d.mesh.position.addScaledVector(d.velocity, delta);
      d.life -= delta;
      d.mesh.material.opacity = Math.max(0, d.life);

      if (d.life <= 0) {
        groupRef.current?.remove(d.mesh);
        dropsRef.current.splice(idx, 1);
      }
    });
  });

  if (!brewing || intensity <= 0) return null;

  return <group ref={groupRef} position={position} />;
}
