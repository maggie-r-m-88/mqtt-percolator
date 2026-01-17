"use client";

export default function TableTop() {
    return (
        <mesh position={[0, -.37, 0]}>
            {/* args: [width, height, depth] */}
            <boxGeometry args={[3, 0.05, 3]} />
            <meshStandardMaterial
                color="#BBBBBB"
                metalness={0.2}
                roughness={0.6}
            />
        </mesh>
    );
}

