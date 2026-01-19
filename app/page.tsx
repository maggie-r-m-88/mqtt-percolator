"use client";

import { useEffect, useState } from "react";
import MokaController from "./components/Controller/MokaController";
import Moka3D from "./components/Mokda3d";

export type MokaState = "heating" | "brewing" | "finished" | "idle";

const MAX_WATER = 100;

export default function Home() {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [pressure, setPressure] = useState<number | null>(null);
  const [coffeeVolume, setCoffeeVolume] = useState<number | null>(null);
  const [state, setState] = useState<MokaState | null>(null);

  const waterVolume =
    coffeeVolume !== null ? Math.max(0, MAX_WATER - coffeeVolume) : 0;

  useEffect(() => {
/*     console.log("🏠 Home state update:", {
      temperature,
      pressure,
      coffeeVolume,
      waterVolume,
      state,
    }); */
  }, [temperature, pressure, coffeeVolume, waterVolume, state]);

  // Toggle this to use static demo values for testing
  const USE_DEMO_VALUES =  false;

  const demoTemperature = 70;
  const demoPressure = 1.2;
  const demoCoffeeVolume = 50;
  const demoState: MokaState = "idle";
  const demoWaterVolume = MAX_WATER - demoCoffeeVolume;

  return (
    <div className="relative h-screen w-screen background">
      {/* Main container: Moka3D fills, control panel floats */}
      <div className="relative flex justify-center items-center h-full w-full">
        {/* Centered 3D Moka */}
        <Moka3D
          temperature={USE_DEMO_VALUES ? demoTemperature : (temperature ?? 20)}
          pressure={USE_DEMO_VALUES ? demoPressure : (pressure ?? 0)}
          coffeeVolume={USE_DEMO_VALUES ? demoCoffeeVolume : (coffeeVolume ?? 0)}
          waterVolume={USE_DEMO_VALUES ? demoWaterVolume : waterVolume}
          state={USE_DEMO_VALUES ? demoState : state}
        />

        {/* Floating control panel - top-left of this container */}
        <div className="absolute top-4 left-4 z-50">
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
        </div>
      </div>
    </div>
  );
}
