"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Bounds } from "@react-three/drei";
import { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import WarmerRing from "./WarmerRing";

type MokaState = "heating" | "brewing" | "finished" | "idle";

type Moka3DProps = {
    temperature: number | null;
    pressure: number | null;
    coffeeVolume: number | null;
    waterVolume: number | null;
    state: MokaState | null;
};


type MokaPotTransparentProps = {
  state: MokaState | null;
};

function MokaPotTransparent({ state }: MokaPotTransparentProps) {
  const gltf = useGLTF("/italian_coffee_machine_moka-compressed.glb");

  useEffect(() => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color.set("white");
        child.material.transparent = true;

        // Adjust opacity based on state
        if (state === "idle") {
          child.material.opacity = 0.55; // more opaque when idle
        } else {
          child.material.opacity = 0.15; // more transparent when active
        }

        child.material.depthWrite = false;
      }
    });
  }, [gltf, state]); // add state as dependency

  return <primitive object={gltf.scene} />;
}


function CoffeeGrounds() {
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


function TableTop() {
    return (
        <mesh position={[0, -.37, 0]}>
            {/* args: [width, height, depth] */}
            <boxGeometry args={[3, 0.05, 3]} />
            <meshStandardMaterial
                color="#222"        // dark tabletop
                metalness={0.2}     // slightly metallic
                roughness={0.6}     // not shiny
            />
        </mesh>
    );
}


export default function Moka3D({
    temperature,
    pressure,
    coffeeVolume,
    waterVolume,
    state,
}: Moka3DProps) {
    // Console log whenever props update
    useEffect(() => {
        console.log("🔥 Moka3D Props Updated:", {
            temperature,
            pressure,
            coffeeVolume,
            waterVolume,
            state,
        });
    }, [temperature, pressure, coffeeVolume, waterVolume, state]);

    const isIdle = state === "idle";
    const visibleWater = waterVolume !== null && !isIdle;
    const visibleCoffee = coffeeVolume !== null && !isIdle;


    // Calculate water level position and height
    const waterRatio = waterVolume !== null ? Math.max(0, Math.min(1, waterVolume / 100)) : 0;

    const WATER_HEIGHT_MIN = 0.01;
    const WATER_HEIGHT_MAX = 0.57;

    const WATER_Y_START = -0.02;
    const WATER_Y_END = -0.32;

    const waterHeight =
        WATER_HEIGHT_MIN +
        waterRatio * (WATER_HEIGHT_MAX - WATER_HEIGHT_MIN);

    const waterY =
        WATER_Y_END +
        waterRatio * (WATER_Y_START - WATER_Y_END);

    // --- Coffee level (dynamic now) ---
    const coffeeRatio = coffeeVolume !== null ? Math.min(Math.max(coffeeVolume / 100, 0), 1) : 0;

    const coffeeY = 0.59 + coffeeRatio * (0.86 - 0.59);
    const coffeeTopRadius = 0.01 + coffeeRatio * (0.48 - 0.01);
    const coffeeBottomRadius = 0.40; // stays constant
    const coffeeHeight = 0.01 + coffeeRatio * (0.61 - 0.01);



    return (
        <Canvas camera={{ position: [3, 2, 5], fov: 30 }}>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            {/* Controls */}
            <OrbitControls />

            {/* Automatically center and scale the pot */}
            <Bounds fit clip>
                <Center>
                    <group scale={1.5}>


                        {/* Your transparent GLB pot */}
                        <MokaPotTransparent state={state} />


                        <group position={[-0.20, -0.65, 0]}>
                            {/* Funnel base */}
                            <mesh position={[0, 0, 0]}>
                                <cylinderGeometry args={[0.08, 0.05, 0.8, 32]} />
                                <meshStandardMaterial
                                    color="gray"
                                    transparent
                                    opacity={0.2}
                                    depthWrite={false}
                                />
                            </mesh>

                            {/* Short top cylinder (spout) */}
                            <mesh position={[0, 0.45, 0]}>
                                <cylinderGeometry args={[0.38, 0.38, 0.2, 32]} />
                                <meshStandardMaterial
                                    color="gray"
                                    transparent
                                    opacity={0.2}
                                    depthWrite={false}
                                />
                            </mesh>

                            {/* ---------------- Dynamic water level ---------------- */}
                            {/* ---------------- Dynamic water level ---------------- */}
                            {waterVolume !== null && state !== "idle" && (
                                <mesh position={[0, waterY, 0]}>
                                    <cylinderGeometry args={[0.41, 0.47, waterHeight, 32]} />
                                    <meshStandardMaterial
                                        color="lightblue"
                                        transparent
                                        opacity={0.5}
                                    />
                                </mesh>
                            )}


                            {/* ---------------- Finished coffee (MAX level) ---------------- */}
                            {/* ---------------- Finished coffee ---------------- */}
                            {coffeeVolume !== null && state !== "idle" && (
                                <mesh position={[0, coffeeY, 0]}>
                                    <cylinderGeometry args={[coffeeTopRadius, coffeeBottomRadius, coffeeHeight, 32]} />
                                    <meshStandardMaterial
                                        color={new THREE.Color().lerpColors(
                                            new THREE.Color("#d9b382"),
                                            new THREE.Color("#3b2415"),
                                            coffeeRatio
                                        )}
                                        transparent
                                        opacity={0.6}
                                        roughness={0.4}
                                        metalness={0}
                                    />
                                </mesh>
                            )}

                            {/* ---------------- Coffee grounds ---------------- */}
                            <CoffeeGrounds />

                            <WarmerRing temperature={temperature} idle={state === "idle"} />

                            <TableTop />
                        </group>
                    </group>
                </Center>

            </Bounds>
        </Canvas>
    );
}
