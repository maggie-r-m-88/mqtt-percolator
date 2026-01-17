"use client";

import { useEffect, useRef } from "react";
import { Client, Message } from "paho-mqtt";

type MokaState = "heating" | "brewing" | "finished" | "idle";

type Props = {
  temperature: number | null;
  pressure: number | null;
  coffeeVolume: number | null;
  state: MokaState | null;
  setTemperature: (val: number) => void;
  setPressure: (val: number) => void;
  setCoffeeVolume: (val: number) => void;
  setState: (val: MokaState) => void;
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
  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);

  const CLIENT_ID = "moka-simulator-ui";
  const USERNAME = process.env.NEXT_PUBLIC_HIVEMQ_USERNAME!;
  const PASSWORD = process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD!;
  const WSS_URL = process.env.NEXT_PUBLIC_HIVEMQ_BROKER_URL!;

  useEffect(() => {
    if (clientRef.current) return;

    const mqttClient = new Client(WSS_URL, CLIENT_ID);
    clientRef.current = mqttClient;

    mqttClient.onMessageArrived = (message: Message) => {
      const { destinationName, payloadString } = message;

      switch (destinationName) {
        case "moka/temperature":
          setTemperature(Number(payloadString));
          break;
        case "moka/pressure":
          setPressure(Number(payloadString));
          break;
        case "moka/coffee_volume":
          setCoffeeVolume(Number(payloadString));
          break;
        case "moka/state":
          setState(payloadString as MokaState);
          break;
      }
    };

    mqttClient.onConnectionLost = (err) => {
      console.error("❌ MQTT connection lost", err);
    };

    mqttClient.connect({
      useSSL: true,
      userName: USERNAME,
      password: PASSWORD,
      cleanSession: false, // persistent session
      keepAliveInterval: 30,
      onSuccess: () => {
        console.log("✅ Frontend connected (persistent)");
        if (!subscribedRef.current) {
          mqttClient.subscribe("moka/#", { qos: 1 });
          subscribedRef.current = true;
        }
      },
      onFailure: (err) => {
        console.error("❌ MQTT frontend connection failed", err);
      },
    });

    return () => {
      try {
        mqttClient.disconnect();
      } catch {}
    };
  }, [setTemperature, setPressure, setCoffeeVolume, setState]);

  const start = async () => fetch("/api/start");
  const stop = async () => fetch("/api/stop");
  const reset = async () => fetch("/api/reset");

  return (
    <div className="w-full flex items-center justify-between bg-gray-100 p-2 px-4 space-x-4">
      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={start}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Start
        </button>
        <button
          onClick={stop}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Stop
        </button>
        <button
          onClick={reset}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Reset
        </button>
      </div>

      {/* Data display */}
      <div className="flex gap-4 text-sm text-gray-700">
        <div>
          <strong>Temp:</strong> {temperature ?? "—"} °C
        </div>
        <div>
          <strong>Pressure:</strong> {pressure ?? "—"} bar
        </div>
        <div>
          <strong>Coffee:</strong> {coffeeVolume ?? "—"} ml
        </div>
        <div>
          <strong>State:</strong> {state ?? "—"}
        </div>
      </div>
    </div>
  );
}
