"use client";

import { useEffect, useState } from "react";
import mqtt, { MqttClient } from "mqtt";

const MQTT_URL = "wss://test.mosquitto.org:8081/mqtt";
const TOPIC = "demo/nextjs/test";

export default function MqttComponent() {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_URL);

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT");
      mqttClient.subscribe(TOPIC);
    });

    mqttClient.on("message", (topic, payload) => {
      setMessages(prev => [...prev, payload.toString()]);
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  const publishMessage = () => {
    if (!client || !input) return;
    client.publish(TOPIC, input);
    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>MQTT Demo</h2>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Message"
      />
      <button onClick={publishMessage}>Publish</button>

      <h3>Messages</h3>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
