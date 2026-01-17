"use client";

import { useEffect, useState } from "react";
import MokaController from "./components/MokaController";
import Moka3D from "./components/Mokda3d";

export type MokaState = "heating" | "brewing" | "finished" | "idle";

const MAX_WATER = 100;

export default function Home() {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [pressure, setPressure] = useState<number | null>(null);
  const [coffeeVolume, setCoffeeVolume] = useState<number | null>(null);
  const [state, setState] = useState<MokaState | null>(null);

  // ✅ Derive water volume from coffee volume
  const waterVolume =
    coffeeVolume !== null ? Math.max(0, MAX_WATER - coffeeVolume) : 0;

  // 🔎 Log lifted + derived state
  useEffect(() => {
    console.log("🏠 Home state update:", {
      temperature,
      pressure,
      coffeeVolume,
      waterVolume,
      state,
    });
  }, [temperature, pressure, coffeeVolume, waterVolume, state]);

  return (
    <div className="relative h-screen w-screen bg-gray-50">
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold">Moka Simulator</h1>
      </header>

      <main className="flex justify-center items-center h-full">
        <Moka3D
          temperature={temperature}
          pressure={pressure}
          coffeeVolume={coffeeVolume ?? 0}
          waterVolume={waterVolume}
          state={state}
        />
      </main>

      <footer className="absolute top-0 left-0 w-full p-4 bg-white shadow-md">
        <MokaController
          temperature={temperature}
          pressure={pressure}
          coffeeVolume={coffeeVolume}
          state={state}
          setTemperature={setTemperature}
          setPressure={setPressure}
          setCoffeeVolume={setCoffeeVolume}
          setState={setState}
        />
      </footer>
    </div>
  );
}
