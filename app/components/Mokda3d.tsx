"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Bounds } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import WarmerRing from "./WarmerRing";
import MokaPotTransparent from "./MokaPotTransparent";
import CoffeeGrounds from "./CoffeeGrounds";
import TableTop from "./TableTop";
import Steam from "./Steam";
import Water from "./Water";
import FinishedCoffee from "./Coffee";
import WaterSteam from "./WaterSteam";
import CoffeeStream from "./CoffeeStream";
import PressureIndicator from "./PressureInidcator";


type MokaState = "heating" | "brewing" | "finished" | "idle";

type Moka3DProps = {
    temperature: number | null;
    pressure: number | null;
    coffeeVolume: number | null;
    waterVolume: number | null;
    state: MokaState | null;
};


export default function Moka3D({
    temperature,
    pressure,
    coffeeVolume,
    waterVolume,
    state,
}: Moka3DProps) {
    // Console log whenever props update
    useEffect(() => {
        /* console.log("🔥 Moka3D Props Updated:", {
            temperature,
            pressure,
            coffeeVolume,
            waterVolume,
            state,
        }); */
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
        <Canvas camera={{ position: [3, 2, 5], fov: 30 }} >
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            {/* Controls */}
            <OrbitControls minDistance={4}
                maxDistance={8}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2} />

            {/* Automatically center and scale the pot */}
            <Bounds fit clip>
                <Center>
                    <group scale={1.5}>

                        <group position={[-0.85, -0.35, 0]}>
                            <Steam active={state === "finished"} />
                        </group>
                        {(state === "heating" || state === "brewing") && (
                        <PressureIndicator
                            position={[-.19,-.5, 0]} // slightly above moka top
                              radius={0.08}
    segments={4}
    rotation={[0, 0, 0]}
    pressure={pressure}       // <-- link to live pressure
    maxPressure={1.5}         // max expected pressure of your moka pot
                            />)}



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

                                    opacity={.2}        // fully opaque
                                    transparent={true} // ensure material is not transparent
                                    depthWrite={true}  // allow depth buffer to render correctly
                                />
                            </mesh>

                            <CoffeeStream
                                brewing={state === "brewing"}
                                coffeeRatio={coffeeRatio}
                                position={[0, 1.15, 0]} // adjust to spout exit
                            />

                            {/* ---------------- Dynamic water level ---------------- */}
                            <Water waterVolume={waterVolume} state={state} />

                            <WaterSteam
                                waterY={waterY}
                                waterRadius={0.42}
                                temperature={temperature}
                                waterVolume={waterVolume}
                                active={state === "heating" || state === "brewing"}
                            />

                            {/* ---------------- Finished coffee ---------------- */}
                            {coffeeVolume !== null && (state === "brewing" || state === "finished") && (
                                <FinishedCoffee
                                    coffeeVolume={coffeeVolume}
                                    state={state}
                                />
                            )}

                            {/* ---------------- Coffee grounds ---------------- */}
                            <CoffeeGrounds coffeeRatio={coffeeRatio} />

                            <WarmerRing temperature={temperature} idle={state === "idle"} />

                            <TableTop />
                        </group>
                    </group>
                </Center>

            </Bounds>
        </Canvas>
    );
}
