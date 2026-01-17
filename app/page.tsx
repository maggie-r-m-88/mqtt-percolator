"use client";

import { useEffect, useRef, useState } from "react";
import { Client, Message } from "paho-mqtt";
import MokaController from "./components/MokaController";
import Moka3D from "./components/Mokda3d";

type MokaState = "heating" | "brewing" | "finished";

export default function Home() {
  // ---- Lifted state ----
  const [temperature, setTemperature] = useState<number | null>(null);
  const [pressure, setPressure] = useState<number | null>(null);
  const [coffeeVolume, setCoffeeVolume] = useState<number | null>(null);
  const [state, setState] = useState<MokaState | null>(null);

  // ---- Pass setters to MokaController ----
  return (
    <div className="relative h-screen w-screen bg-gray-50">
      {/* Header */}
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold">Moka Simulator</h1>
      </header>

      {/* 3D Moka Pot */}
      <main className="flex justify-center items-center h-full">
        <Moka3D
  coffeeVolume={coffeeVolume ?? 0}
  waterVolume={temperature && pressure ? Math.min(coffeeVolume ?? 0, 100) : 0}
  coffeeGroundsHeight={0.2}
/>

      </main>

      {/* Controls fixed at top */}
      <footer className="absolute top-0 left-0 w-full p-4 bg-white shadow-md">
        <MokaController
          setTemperature={setTemperature}
          setPressure={setPressure}
          setCoffeeVolume={setCoffeeVolume}
          setState={setState}
          temperature={temperature}
          pressure={pressure}
          coffeeVolume={coffeeVolume}
          state={state}
        />
      </footer>
    </div>
  );
}
