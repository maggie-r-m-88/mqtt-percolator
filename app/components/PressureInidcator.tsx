"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type PressureWavesProps = {
  radius?: number;          // base radius of the circle
  height?: number;          // vertical position on the pot
  pressure: number | null;  // 0–100
  lineCount?: number;       // how many circular lines
};

export default function PressureWaves({
  radius = 0.65,
  height = -.45,
  pressure,
  lineCount = 3,
}: PressureWavesProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Create line geometries
  const lines = useMemo(() => {
    const arr: THREE.Line[] = [];
    for (let i = 0; i < lineCount; i++) {
      const segments = 64;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(segments * 3);

      for (let j = 0; j < segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        positions[j * 3] = Math.cos(angle) * radius;
        positions[j * 3 + 1] = 0;
        positions[j * 3 + 2] = Math.sin(angle) * radius;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: "#ff4444",
        transparent: true,
        opacity: 0.5,
      });

      const line = new THREE.LineLoop(geometry, material);
      line.position.y = height + i * 0.005; // stagger vertically
      arr.push(line);
    }
    return arr;
  }, [radius, height, lineCount]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !pressure) return;

    const normalizedPressure = Math.min(Math.max(pressure / 100, 0), 1);

    lines.forEach((line, idx) => {
      const pos = line.geometry.attributes.position as THREE.BufferAttribute;
      const segments = pos.count;

      for (let i = 0; i < segments; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const angle = Math.atan2(z, x);
        const wave = Math.sin(clock.getElapsedTime() * 2 + angle * 6 + idx) * 0.005 * normalizedPressure;
        pos.setY(i, wave);
      }

      pos.needsUpdate = true;
    });

    // Optional: rotate the group slowly for effect
    groupRef.current.rotation.y += 0.005 * normalizedPressure;
  });

  return <group ref={groupRef}>{lines.map((line, i) => <primitive key={i} object={line} />)}</group>;
}
