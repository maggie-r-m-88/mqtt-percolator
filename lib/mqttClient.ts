import mqtt, { MqttClient } from "mqtt";

let client: MqttClient;

export function getMqttClient(): MqttClient {
  if (!client) {
    const CLIENT_ID = "moka-simulator-ui";
    const BROKER_URL = process.env.HIVEMQ_BROKER_URL!;
    const USERNAME = process.env.HIVEMQ_USERNAME!;
    const PASSWORD = process.env.HIVEMQ_PASSWORD!;

    if (!BROKER_URL || !USERNAME || !PASSWORD) {
      throw new Error("Missing HiveMQ environment variables");
    }

    client = mqtt.connect(BROKER_URL, {
      clientId: CLIENT_ID,
      username: USERNAME,
      password: PASSWORD,
    });

    client.on("connect", () => console.log("✅ MQTT API client connected"));
    client.on("error", (err) => console.error("❌ MQTT error", err));
  }
  return client;
}
