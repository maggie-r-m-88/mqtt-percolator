type WarmerRingProps = {
  temperature: number | null;
  state: MokaState | null;
};

export default function WarmerRing({ temperature, state }: WarmerRingProps) {
  const MAX_TEMP = 95;

  const MIN_THICKNESS = 0.004;
  const MAX_THICKNESS = 0.045;

  const heatRatio = temperature
    ? Math.min(Math.max(temperature / MAX_TEMP, 0), 1)
    : 0;

  const baseThickness =
    MIN_THICKNESS + heatRatio * (MAX_THICKNESS - MIN_THICKNESS);

  const isIdle = state === "idle";

  const color = isIdle ? "#000000" : "#ff6600";

  return (
    <group position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Inner ring */}
      <mesh>
        <torusGeometry args={[0.42, baseThickness * 0.7, 16, 100]} />
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.5}
          emissive="#ff3300"
          emissiveIntensity={isIdle ? 0 : 0.15 * heatRatio}
          transparent
          opacity={isIdle ? 0 : heatRatio * 0.7}
        />
      </mesh>

      {/* Main ring */}
      <mesh>
        <torusGeometry args={[0.5, baseThickness, 16, 120]} />
        <meshStandardMaterial
          color={color}
          metalness={0.6}
          roughness={0.4}
          emissive="#ff3300"
          emissiveIntensity={isIdle ? 0 : 0.35 * heatRatio}
          transparent
          opacity={isIdle ? 0 : heatRatio}
        />
      </mesh>

      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[0.6, baseThickness * 0.6, 16, 120]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.6}
          emissive="#ff2200"
          emissiveIntensity={isIdle ? 0 : 0.12 * heatRatio}
          transparent
          opacity={isIdle ? 0 : heatRatio * 0.5}
        />
      </mesh>
    </group>
  );
}
