"use client";

import { useEffect, useRef, useState } from "react";
import { Client, Message } from "paho-mqtt";
import { MokaState } from "../../page";
import { Power, Zap, Droplet } from "lucide-react";

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
  // Backend mode check
  const useBackendSimulator = process.env.NEXT_PUBLIC_USE_BACKEND_SIMULATOR === "true";

  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);
  const [disconnected, setDisconnected] = useState(false);

  const simRef = useRef({
    interval: null as NodeJS.Timeout | null,
    isRunning: false,
  });

  // MQTT connection (backend)
  useEffect(() => {
    if (!useBackendSimulator) return;
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
        case "moka/temperature": setTemperature(Number(value)); break;
        case "moka/pressure": setPressure(Number(value)); break;
        case "moka/coffee_volume": setCoffeeVolume(Number(value)); break;
        case "moka/state": setState(value as MokaState); break;
      }
    };

    client.onConnectionLost = () => setDisconnected(true);

    client.connect({
      useSSL: true,
      userName: USERNAME,
      password: PASSWORD,
      cleanSession: false,
      onSuccess: () => {
        setDisconnected(false);
        if (!subscribedRef.current) {
          client.subscribe("moka/#", { qos: 1 });
          subscribedRef.current = true;
        }
      },
      onFailure: () => setDisconnected(true),
    });

    return () => { try { client.disconnect(); } catch { } };
  }, [useBackendSimulator, setTemperature, setPressure, setCoffeeVolume, setState]);

  // Simulation helpers
  const updateAll = (temp: number, press: number, coffee: number, st: MokaState) => {
    setTemperature(temp);
    setPressure(press);
    setCoffeeVolume(coffee);
    setState(st);
  };

  const TICK_MS = 200;
  const TOTAL_TICKS = 20_000 / TICK_MS;
  const TEMP_DELTA = (95 - 20) / TOTAL_TICKS;
  const COFFEE_DELTA = 100 / TOTAL_TICKS;

  const start = () => {
    if (useBackendSimulator) { fetch("/api/start"); return; }
    const sim = simRef.current;
    if (sim.isRunning) return;

    let temp = 20, press = 0, coffee = 0;
    let st: MokaState = "heating";
    sim.isRunning = true;
    updateAll(temp, press, coffee, st);

    sim.interval = setInterval(() => {
      if (temp < 95) temp += TEMP_DELTA;
      press = Math.min(1.5, Math.max(0, (temp - 50) / 30));
      if (press >= 1 && coffee < 100) { coffee += COFFEE_DELTA; st = "brewing"; }
      if (coffee >= 100) { coffee = 100; st = "finished"; updateAll(temp, press, coffee, st); stop(true); return; }
      updateAll(temp, press, coffee, st);
    }, TICK_MS);
  };

  const stop = (fromFinish = false) => {
    if (useBackendSimulator) { fetch("/api/stop"); return; }
    const sim = simRef.current;
    if (sim.interval) { clearInterval(sim.interval); sim.interval = null; }
    if (!fromFinish) updateAll(20, 0, 0, "idle");
    sim.isRunning = false;
  };

  const reset = () => {
    if (useBackendSimulator) { fetch("/api/reset"); return; }
    const sim = simRef.current;
    if (sim.interval) { clearInterval(sim.interval); sim.interval = null; }
    updateAll(20, 0, 0, "idle");
    sim.isRunning = false;
  };

  const isRunning = useBackendSimulator ? state === "heating" || state === "brewing" : simRef.current.isRunning;

  const coffeePercent = coffeeVolume ?? 0;
  const tempValue = temperature ?? 20;
  const pressureValue = pressure ?? 0;

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-2 md:p-6 border border-slate-700/50 shadow-sm md:shadow-2xl w-full md:w-60 lg:w-100">

      {/* Status */}
      <div className="bg-slate-900/50 rounded-lg md:rounded-xl p-2 md:p-3 mb-2 md:mb-5 border border-slate-700/30">
        <div className="flex items-center justify-center md:justify-between">
          {/* Optional label, hidden on mobile */}
          <span className="hidden md:block text-slate-400 text-sm font-medium">Status</span>

          {/* Light */}
          <div className="flex items-center gap-2">
            <span className="text-white hidden md:inline text-sm capitalize">{state}</span>
            <div
              className={`w-3 h-3 rounded-full ${state === "heating"
                  ? "bg-red-500 animate-pulse"
                  : state === "brewing"
                    ? "bg-orange-500 animate-pulse"
                  : state === "finished"
                    ? "bg-emerald-500"
                    : "bg-slate-600"
                }`}
            />
          </div>
        </div>
      </div>


      {/* Power Toggle */}
      <div className="mb-5">
        <button
          onClick={() => (isRunning ? stop() : start())}
          className={`w-full h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center md:justify-between px-2 md:px-6 transition-all duration-300 ${isRunning
              ? "bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/30"
              : "bg-slate-700 hover:bg-slate-600"
            }`}
        >
          {/* Power Icon */}
          <Power className="w-5 h-5 md:w-6 md:h-6 text-white" />

          {/* ON/OFF text */}
          <span className="mx-2 text-white font-bold text-sm md:text-lg md:mx-0">
            {isRunning ? "ON" : "OFF"}
          </span>

          {/* Toggle Slider (desktop only) */}
          <div
            className={`hidden md:flex w-12 h-6 rounded-full relative transition-all duration-300 ${isRunning ? "bg-white/20" : "bg-slate-800"
              }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ${isRunning ? "left-6" : "left-0.5"
                }`}
            />
          </div>
        </button>
      </div>


      {/* Control Buttons */}
      {/* <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => stop()} // call stop with no args
          className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
        >
          Stop
        </button>

        <button
          onClick={reset}
          className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
        >
          Reset
        </button>
      </div> */}

      {/* Temperature */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <Droplet className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm md:text-lg">{Math.round(tempValue)}°C</span>
        </div>
        <div className="bg-slate-900/50 rounded-lg h-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${tempValue}%`, background: `linear-gradient(to right, #3b82f6, #f59e0b, #ef4444)` }} />
        </div>
      </div>

      {/* ---------------- Pressure (Circular Barometer) ---------------- */}
      <div className="mb-2 md:mb-5 flex flex-col items-center">
        <span className="text-white font-bold text-sm md:text-lg mb-2">{pressureValue.toFixed(2)} bar</span>

        <svg className="w-12 h-12 md:w-24 md:h-24" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            className="text-slate-700"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            cx="18"
            cy="18"
            r="16"
          />
          {/* Foreground progress circle */}
          <circle
            stroke="url(#pressureGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            cx="18"
            cy="18"
            r="16"
            strokeDasharray={`${(pressureValue / 2) * 100} 100`}
            transform="rotate(-90 18 18)"
            className="transition-all duration-300"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>


    </div>
  );
}
