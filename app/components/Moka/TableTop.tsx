"use client";

export default function TableTop() {
    return (
        <mesh position={[0, -9, 0]}>
            {/* args: [width, height, depth] */}
            <boxGeometry args={[4, 1, 4]} />
            <meshStandardMaterial
                color="#BBBBBB"
                metalness={0.2}
                roughness={0.6}
            />
        </mesh>
    );
}

