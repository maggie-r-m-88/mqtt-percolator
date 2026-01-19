"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

type MokaState = "heating" | "brewing" | "finished" | "idle";

type MokaPotTransparentProps = {
    state: MokaState | null;
};

export default function MokaPotTransparent({ state }: MokaPotTransparentProps) {
    const gltf = useGLTF("/italian_coffee_machine_moka-compressed.glb");

    useEffect(() => {
        gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.color.set("white");
                child.material.transparent = true;
                child.material.opacity = 0.1;

                child.material.depthWrite = false;
            }
        });
    }, [gltf, state]);

    return <primitive object={gltf.scene} />;
}

