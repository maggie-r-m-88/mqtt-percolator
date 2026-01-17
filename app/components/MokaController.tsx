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
  const clientRef = useRef<Client | null>(null);
  const subscribedRef = useRef(false);
  const [disconnected, setDisconnected] = useState(false);

  const CLIENT_ID = "moka-simulator-ui";
  const USERNAME = process.env.NEXT_PUBLIC_HIVEMQ_USERNAME!;
  const PASSWORD = process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD!;
  const WSS_URL = process.env.NEXT_PUBLIC_HIVEMQ_BROKER_URL!;

  useEffect(() => {
    if (clientRef.current) return;

    const client = new Client(WSS_URL, CLIENT_ID);
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
        console.log("✅ MQTT connected");
        setDisconnected(false);
        if (!subscribedRef.current) {
          client.subscribe("moka/#", { qos: 1 });
          subscribedRef.current = true;
        }
      },
    });

    return () => {
      try {
        client.disconnect();
      } catch {}
    };
  }, [setTemperature, setPressure, setCoffeeVolume, setState]);

  const start = () => fetch("/api/start");
  const stop = () => fetch("/api/stop");
  const reset = () => fetch("/api/reset");

  return (
    <div className="w-full flex flex-col gap-2 bg-gray-100 p-2 px-4">
      {disconnected && (
        <div className="bg-red-200 text-red-800 p-2 rounded text-center">
          ⚡ Coffee Pot Alert: Lost connection! The pot is taking a coffee break ☕
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={start} className="bg-green-500 text-white px-3 py-1 rounded">
            Start
          </button>
          <button onClick={stop} className="bg-red-500 text-white px-3 py-1 rounded">
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
