import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;

export function getFrontendMqttClient(): MqttClient {
  if (!client) {
    const CLIENT_ID = "moka-simulator";
    const WSS_URL = process.env.NEXT_PUBLIC_HIVEMQ_BROKER_URL!;
    const USERNAME = process.env.NEXT_PUBLIC_HIVEMQ_USERNAME!;
    const PASSWORD = process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD!;

    if (!WSS_URL || !USERNAME || !PASSWORD) {
      throw new Error("Missing HiveMQ environment variables");
    }

    console.log("🔌 Connecting frontend API to HiveMQ via WebSocket:", WSS_URL);

    client = mqtt.connect(WSS_URL, {
      clientId: CLIENT_ID,
      username: USERNAME,
      password: PASSWORD,
      clean: false,
      reconnectPeriod: 1000,
    });

    client.on("connect", () => {
      console.log("✅ Frontend MQTT API client connected to HiveMQ");
    });

    client.on("error", (err) => {
      console.error("❌ Frontend MQTT error:", err);
    });
  }

  return client;
}

