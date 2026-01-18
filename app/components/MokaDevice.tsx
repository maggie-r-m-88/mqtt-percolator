"use client";

import { useEffect, useRef } from "react";
import { Client, Message } from "paho-mqtt";
import { MokaState } from "../page";

type Props = {
  setTemperature?: (v: number) => void;
  setPressure?: (v: number) => void;
  setCoffeeVolume?: (v: number) => void;
  setState?: (v: MokaState) => void;
};

export default function MokaDevice({
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

    const client = new Client(WSS_URL, CLIENT_ID);
    clientRef.current = client;

    client.onConnectionLost = () => {
      console.warn("⚡ MQTT disconnected");
    };

    client.onMessageArrived = (msg: Message) => {
      const value = msg.payloadString;

      switch (msg.destinationName) {
        case "moka/temperature":
          console.log("🌡 Temperature:", value);
          setTemperature?.(Number(value));
          break;
        case "moka/pressure":
          console.log("⚡ Pressure:", value);
          setPressure?.(Number(value));
          break;
        case "moka/coffee_volume":
          console.log("☕ Coffee Volume:", value);
          setCoffeeVolume?.(Number(value));
          break;
        case "moka/state":
          console.log("🟢 State:", value);
          setState?.(value as MokaState);
          break;
        default:
          console.log(msg.destinationName, value);
      }
    };

    client.connect({
      useSSL: true,
      userName: USERNAME,
      password: PASSWORD,
      cleanSession: false,
      onSuccess: () => {
        console.log("✅ MQTT Device connected");
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

  return null; // no UI for now, just subscription
}
