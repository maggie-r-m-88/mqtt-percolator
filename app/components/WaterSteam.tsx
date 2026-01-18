"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type SteamBubblesProps = {
    waterY: number;                 // vertical position of water surface
    waterRadius?: number;           // radius of water cylinder
    temperature: number | null;     // current water temperature
    waterVolume: number | null;     // current water volume
    active: boolean;                // only show bubbles when heating/brewing
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
    active,
}: SteamBubblesProps) {
    const groupRef = useRef<THREE.Group>(null);
    const bubblesRef = useRef<Bubble[]>([]);

    // Temperature range for bubbling
    const STEAM_START_TEMP = 80;
    const STEAM_MAX_TEMP = 95;

    // Compute intensity based on temperature & water volume
    const volumeFactor = waterVolume ? Math.max(0, Math.min(1, waterVolume / 100)) : 0;
    const tempFactor = temperature
        ? Math.max(0, Math.min(1, (temperature - STEAM_START_TEMP) / (STEAM_MAX_TEMP - STEAM_START_TEMP)))
        : 0;

    const intensity = active ? volumeFactor * tempFactor : 0;

    useFrame((_, delta) => {
        if (!groupRef.current || intensity <= 0) return;

        // Spawn new bubbles proportional to intensity (slightly more noticeable)
        const bubbleCount = Math.ceil(10 * intensity * Math.random());
        for (let i = 0; i < bubbleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.01 + Math.random() * 0.01, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: "#fff",
                transparent: true,
                opacity: 0.3 + Math.random() * 0.2,
            });
            const mesh = new THREE.Mesh(geometry, material);

            // Spawn randomly inside circular water surface
            const r = Math.random() * waterRadius;
            const theta = Math.random() * 2 * Math.PI;
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            mesh.position.set(x, waterY + 0.15, z);

            groupRef.current.add(mesh);

            bubblesRef.current.push({
                mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.002,
                    0.03 + Math.random() * 0.02 * intensity,
                    (Math.random() - 0.5) * 0.002
                ),
                life: 1 + Math.random() * 0.5 * intensity,
            });
        }

        // Update existing bubbles
        bubblesRef.current.forEach((b, idx) => {
            b.mesh.position.addScaledVector(b.velocity, delta);
            b.life -= delta;
            b.mesh.material.opacity = Math.max(0, b.life);

            if (b.life <= 0) {
                groupRef.current?.remove(b.mesh);
                bubblesRef.current.splice(idx, 1);
            }
        });
    });

    if (intensity <= 0) return null;

    return <group ref={groupRef} />;
}
