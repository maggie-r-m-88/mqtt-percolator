"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Bounds } from "@react-three/drei";
import { useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";



function MokaPotTransparent() {
    const gltf = useGLTF("/italian_coffee_machine_moka.glb");

    // Make the model semi-transparent
    useEffect(() => {
        gltf.scene.traverse((child: any) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.color.set("white");
                child.material.transparent = true;
                child.material.opacity = 0.2;
                child.material.depthWrite = false;
            }
        });
    }, [gltf]);

    const coffeeTexture = useTexture("/coffee-ground.webp");

useEffect(() => {
  coffeeTexture.wrapS = coffeeTexture.wrapT = THREE.RepeatWrapping;
  coffeeTexture.repeat.set(2, 1); // repeat around the cylinder
}, [coffeeTexture]);


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

function BrewedCoffee() {
  const texture = useTexture("/coffee-ground.webp");

  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
  }, [texture]);

  // Profile points (Y = height, X = radius)
  const points = [
    new THREE.Vector2(0.42, 0.0),   // bottom
    new THREE.Vector2(0.46, 0.35),  // mid body
    new THREE.Vector2(0.50, 0.48),  // wider near top
    new THREE.Vector2(0.40, 0.55),  // slope inward toward spout
  ];

  return (
    <mesh position={[0, 0.85, 0]}>
      <latheGeometry args={[points, 64]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.65}
        roughness={0.4}
        metalness={0}
        side={THREE.DoubleSide}
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

function WarmerRing() {
  return (
    <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Torus: args = [radius, tube thickness, radial segments, tubular segments] */}
      <torusGeometry args={[0.5, 0.05, 16, 100]} />
      <meshStandardMaterial
        color="#ff6600"
        metalness={0.6}
        roughness={0.4}
        emissive="#ff3300"
        emissiveIntensity={0.3} // slightly glowing
      />
    </mesh>
  );
}




export default function Moka3D() {
    return (
        <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            {/* Controls */}
            <OrbitControls />

            {/* Automatically center and scale the pot */}
            <Bounds fit clip damping={6}>
                <Center>
                    <group scale={1.5}>

                   
                        {/* Your transparent GLB pot */}
                        <MokaPotTransparent />

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

                            {/* ---------------- Static water level (funnel-shaped) ---------------- */}
                            <mesh position={[0, -0.02, 0]}>
                                <cylinderGeometry args={[0.38, 0.47, 0.57, 32]} />
                                <meshStandardMaterial
                                    color="lightblue"
                                    transparent
                                    opacity={0.5}
                                />
                            </mesh>

                            {/* ---------------- Finished coffee (MAX level) ---------------- */}
                            <mesh position={[0, .86, 0]}>
                            {/* top wider than bottom */}
                            <cylinderGeometry args={[0.48, 0.40, 0.61, 32]} />
                            <meshStandardMaterial
                                color="#3b2415"
                                transparent
                                opacity={0.6}
                                roughness={0.4}
                                metalness={0}
                            />
                            </mesh>
                            {/* ---------------- Coffee grounds ---------------- */}
                            <CoffeeGrounds />  

                            <WarmerRing />

                            <TableTop /> 
                        </group>
                    </group>
                </Center>

            </Bounds>
        </Canvas>
    );
}
