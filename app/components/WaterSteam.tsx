"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type SteamBubblesProps = {
    waterY: number;                 // vertical position of water surface
    waterRadius?: number;           // radius of water cylinder
    temperature: number | null;     // current water temperature
    waterVolume: number | null;     // current water volume
};

type Bubble = {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    life: number;
};

export default function SteamBubbles({
    waterY,
    waterRadius = 0.42,
    temperature,
    waterVolume,
}: SteamBubblesProps) {
    const groupRef = useRef<THREE.Group>(null);
    const bubblesRef = useRef<Bubble[]>([]);

    // Temperature range for bubbles
    const STEAM_START_TEMP = 92;
    const STEAM_MAX_TEMP = 95;

    // Compute intensity based on temperature
    const volumeFactor = waterVolume ? Math.max(0, Math.min(1, waterVolume / 100)) : 0;
    const intensity = temperature
        ? volumeFactor * Math.max(0, Math.min(1, (temperature - 92) / (100 - 92)))
        : 0;


    useFrame((_, delta) => {
        if (!groupRef.current || intensity <= 0) return;

        // Spawn new bubbles proportional to intensity
        const bubbleCount = Math.ceil(5 * intensity * Math.random());
        for (let i = 0; i < bubbleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.01 + Math.random() * 0.01, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: "#fff",
                transparent: true,
                opacity: 0.3 + Math.random() * 0.2,
            });
            const mesh = new THREE.Mesh(geometry, material);

            // Spawn inside water radius at water surface (circular)
            const r = Math.random() * waterRadius;          // random radius
            const theta = Math.random() * 2 * Math.PI;      // random angle
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            mesh.position.set(x, waterY + 0.15, z);

            groupRef.current.add(mesh);

            bubblesRef.current.push({
                mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.002,
                    0.03 + Math.random() * 0.02 * intensity, // faster for higher temp
                    (Math.random() - 0.5) * 0.002
                ),
                life: 1 + Math.random() * 0.5 * intensity, // fade faster at lower temp
            });
        }

        // Update existing bubbles
        bubblesRef.current.forEach((b, idx) => {
            b.mesh.position.addScaledVector(b.velocity, delta);
            b.life -= delta;
            b.mesh.material.opacity = Math.max(0, b.life); // fade out

            if (b.life <= 0) {
                groupRef.current?.remove(b.mesh);
                bubblesRef.current.splice(idx, 1);
            }
        });
    });

    if (intensity <= 0) return null;

    return <group ref={groupRef} />;
}
