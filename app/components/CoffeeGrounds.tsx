"use client";

import { useTexture } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function CoffeeGrounds() {
    const texture = useTexture("/coffee-ground.webp");

    useEffect(() => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        // X = around circumference
        // Y = vertical tiling
        texture.repeat.set(6, 2);
    }, [texture]);

    return (
        <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.2, 32]} />
            <meshStandardMaterial
                map={texture}
                roughness={0.95}
                metalness={0}
            />
        </mesh>
    );
}
