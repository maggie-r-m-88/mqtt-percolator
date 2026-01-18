"use client";

import { useEffect, useRef, useState } from "react";
import { Client, Message } from "paho-mqtt";
import { MokaState } from "../page";

type Props = {
  temperature: number | null;
  pressure: number | null;
  coffeeVolume: number | null;
  state: MokaState | null;
  setTemperature: (v: number) => void;
  setPressure: (v: number) => void;
  setCoffeeVolume: (v: number) => void;
  setState: (v: MokaState) => void;
};

export default function MokaController({
  temperature,
  pressure,
  coffeeVolume,
  state,
  setTemperature,
  setPressure,
  setCoffeeVolume,
  setState,
}: Props) {
  // Check if using backend simulator
  const useBackendSimulator = process.env.NEXT_PUBLIC_USE_BACKEND_SIMULATOR === "true";

  // MQTT state (only for backend mode)
  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);
  const [disconnected, setDisconnected] = useState(false);

  // Simulation state (only for frontend mode)
  const simRef = useRef({
    interval: null as NodeJS.Timeout | null,
    isRunning: false,
  });

  // MQTT connection for backend mode
  useEffect(() => {
    if (!useBackendSimulator) return; // Skip MQTT if frontend mode

    if (clientRef.current) return;

    const CLIENT_ID = "moka-simulator-ui";
    const USERNAME = process.env.NEXT_PUBLIC_HIVEMQ_USERNAME!;
    const PASSWORD = process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD!;
    const WSS_URL = process.env.NEXT_PUBLIC_HIVEMQ_BROKER_URL!;

    const url = new URL(WSS_URL);
    const BROKER_HOST = url.hostname;
    const BROKER_PORT = parseInt(url.port);
    const BROKER_PATH = url.pathname;

    const client = new Client(BROKER_HOST, BROKER_PORT, BROKER_PATH, CLIENT_ID);
    clientRef.current = client;

    client.onMessageArrived = (msg: Message) => {
      const value = msg.payloadString;

      switch (msg.destinationName) {
        case "moka/temperature":
          setTemperature(Number(value));
          break;
        case "moka/pressure":
          setPressure(Number(value));
          break;
        case "moka/coffee_volume":
          setCoffeeVolume(Number(value));
          break;
        case "moka/state":
          setState(value as MokaState);
          break;
      }
    };

    client.onConnectionLost = () => {
      console.log("⚠️ MQTT disconnected");
      setDisconnected(true);
    };

    client.connect({
      useSSL: true,
      userName: USERNAME,
      password: PASSWORD,
      cleanSession: false,
      onSuccess: () => {
        console.log("✅ MQTT connected to HiveMQ");
        setDisconnected(false);
        if (!subscribedRef.current) {
          client.subscribe("moka/#", { qos: 1 });
          subscribedRef.current = true;
          console.log("📡 Subscribed to moka/#");
        }
      },
      onFailure: (err) => {
        console.error("❌ MQTT connection failed:", err);
        setDisconnected(true);
      },
    });

    return () => {
      try {
        client.disconnect();
      } catch {}
    };
  }, [useBackendSimulator, setTemperature, setPressure, setCoffeeVolume, setState]);

  // Update state directly - for frontend mode
  const updateAll = (temp: number, press: number, coffee: number, st: MokaState) => {
    setTemperature(temp);
    setPressure(press);
    setCoffeeVolume(coffee);
    setState(st);
  };

  // Simulation constants
  const TICK_MS = 200;
  const TOTAL_TICKS = 20_000 / TICK_MS;
  const TEMP_DELTA = (95 - 20) / TOTAL_TICKS;
  const COFFEE_DELTA = 100 / TOTAL_TICKS;

  const start = () => {
    if (useBackendSimulator) {
      // Backend mode: call API
      fetch("/api/start");
      return;
    }

    // Frontend mode: run simulation locally
    const sim = simRef.current;

    if (sim.isRunning) {
      console.log("⚠️ Simulation already running");
      return;
    }

    console.log("▶️ Starting simulation (frontend mode)");

    // Local simulation variables
    let temp = 20;
    let press = 0;
    let coffee = 0;
    let st: MokaState = "heating";

    sim.isRunning = true;

    // Initial update
    updateAll(temp, press, coffee, st);

    sim.interval = setInterval(() => {
      // Temperature rise
      if (temp < 95) temp += TEMP_DELTA;

      // Pressure calculation
      press = Math.min(1.5, Math.max(0, (temp - 50) / 30));

      // Brewing logic
      if (press >= 1.0 && coffee < 100) {
        coffee += COFFEE_DELTA;
        st = "brewing";
      }

      // Finish logic
      if (coffee >= 100) {
        coffee = 100;
        st = "finished";
        updateAll(temp, press, coffee, st);
        stop(true);
        return;
      }

      // Update state
      updateAll(temp, press, coffee, st);
    }, TICK_MS);
  };

  const stop = (fromFinish = false) => {
    if (useBackendSimulator) {
      // Backend mode: call API
      fetch("/api/stop");
      return;
    }

    // Frontend mode: stop local simulation
    const sim = simRef.current;

    console.log("⏹️ Stopping simulation");

    if (sim.interval) {
      clearInterval(sim.interval);
      sim.interval = null;
    }

    if (fromFinish) {
      console.log("✅ Brew finished");
      sim.isRunning = false;
      return;
    }

    // Hard reset
    sim.isRunning = false;
    updateAll(20, 0, 0, "idle");
  };

  const reset = () => {
    if (useBackendSimulator) {
      // Backend mode: call API
      fetch("/api/reset");
      return;
    }

    // Frontend mode: reset local simulation
    const sim = simRef.current;

    console.log("🔄 Resetting simulation");

    if (sim.interval) {
      clearInterval(sim.interval);
      sim.interval = null;
    }

    sim.isRunning = false;
    updateAll(20, 0, 0, "idle");
  };

  return (
    <div className="w-full flex flex-col gap-2 bg-gray-100 p-2 px-4">
      {useBackendSimulator && disconnected && (
        <div className="bg-red-200 text-red-800 p-2 rounded text-center">
          ⚡ Coffee Pot Alert: Lost connection! The pot is taking a coffee break ☕
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={start} className="bg-green-500 text-white px-3 py-1 rounded">
            Start
          </button>
          <button onClick={() => stop()} className="bg-red-500 text-white px-3 py-1 rounded">
            Stop
          </button>
          <button onClick={reset} className="bg-yellow-500 text-white px-3 py-1 rounded">
            Reset
          </button>
        </div>

        <div className="flex gap-4 text-sm">
          <div><strong>Temp:</strong> {temperature ?? "—"}</div>
          <div><strong>Pressure:</strong> {pressure ?? "—"}</div>
          <div><strong>Coffee:</strong> {coffeeVolume ?? "—"}</div>
          <div><strong>State:</strong> {state ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}
