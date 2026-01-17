type WarmerRingProps = {
  temperature: number | null;
  idle: boolean; // true if the pot is idle
};

export default function WarmerRing({ temperature, idle }: WarmerRingProps) {
  const MAX_TEMP = 95;
  const MIN_THICKNESS = 0.005; // off / idle
  const MAX_THICKNESS = 0.05;  // fully heated

  // Safely compute heat ratio (0 → 1)
  const heatRatio = temperature
    ? Math.min(Math.max(temperature / MAX_TEMP, 0), 1)
    : 0;

  // Linearly scale the tube thickness based on heat
  const tubeThickness = MIN_THICKNESS + heatRatio * (MAX_THICKNESS - MIN_THICKNESS);

  // Color: black if idle, otherwise heated orange
  const color = idle ? "#000" : "#ff6600";

  return (
    <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.5, tubeThickness, 16, 100]} />
      <meshStandardMaterial
        color={color}
        metalness={0.6}
        roughness={0.4}
        emissive="#ff3300"
        emissiveIntensity={idle ? 0 : 0.3 * heatRatio}
        transparent
        opacity={idle ? 0 : heatRatio} // invisible when idle
      />
    </mesh>
  );
}
