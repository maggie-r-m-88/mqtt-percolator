"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type CoffeeStreamProps = {
  brewing: boolean;
  coffeeRatio: number; // 0 to 1
  position?: [number, number, number];
};

type Particle = {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
};

export default function CoffeeStream({ brewing, coffeeRatio, position = [0, 0, 0] }: CoffeeStreamProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Cone configuration
  const CONE_RADIUS = 0.05 + coffeeRatio * 0.05; // max radius at bottom
  const CONE_HEIGHT = 0.8; // total height of stream

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Spawn new particles when brewing
    if (brewing) {
      const particleCount = Math.ceil(1 + coffeeRatio * .5);
      for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.CylinderGeometry(0.01, 0.01, 0.82, 6);
        const material = new THREE.MeshStandardMaterial({
          color: "#caa472",
          roughness: 0.2,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Spawn inside cone: radius decreases linearly from base to top
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * CONE_RADIUS; // uniform within base circle
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0; // bottom of cone (just above spout)

        mesh.position.set(x, y, z);

        groupRef.current.add(mesh);

        particlesRef.current.push({
          mesh,
          // velocity: upward + small outward to match cone
          velocity: new THREE.Vector3(
            x * 0.2, // slight outward
            0.05 + Math.random() * 0.02,
            z * 0.2
          ),
          life: 1 + Math.random() * 0.5,
        });
      }
    }

    // Update particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];

      // Move particle
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Gravity effect
      p.velocity.y -= 0.02 * delta;

      // Optionally shrink horizontal movement so particle stays inside cone
      const t = p.mesh.position.y / CONE_HEIGHT; // normalized height
      p.mesh.position.x *= 1 - t * 0.5; // gradually reduce x spread
      p.mesh.position.z *= 1 - t * 0.5; // gradually reduce z spread

      // Remove dead particles
      p.life -= delta;
      if (p.life <= 0) {
        groupRef.current?.remove(p.mesh);
        particlesRef.current.splice(i, 1);
      }
    }
  });

  return <group ref={groupRef} position={position} />;
}
