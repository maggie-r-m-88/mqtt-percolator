import mqtt, { MqttClient } from "mqtt";

let client: MqttClient;

export function getMqttClient(): MqttClient {
  if (!client) {
    const CLIENT_ID = "moka-api-" + Math.random().toString(16).slice(2, 8);

    // Mosquitto test broker (no auth required)
    const BROKER_HOST = process.env.MQTT_BROKER_HOST || "test.mosquitto.org";
    const BROKER_PORT = parseInt(process.env.MQTT_BROKER_PORT || "1883");
    const BROKER_URL = `mqtt://${BROKER_HOST}:${BROKER_PORT}`;

    // HiveMQ (commented out for testing with Mosquitto)
    // const BROKER_URL = process.env.HIVEMQ_BROKER_URL!;
    // const USERNAME = process.env.HIVEMQ_USERNAME!;
    // const PASSWORD = process.env.HIVEMQ_PASSWORD!;

    console.log("🔌 Connecting to MQTT broker:", BROKER_URL);

    client = mqtt.connect(BROKER_URL, {
      clientId: CLIENT_ID,
      // username: USERNAME,  // Not needed for Mosquitto
      // password: PASSWORD,  // Not needed for Mosquitto
    });

    client.on("connect", () => console.log("✅ MQTT API client connected to", BROKER_URL));
    client.on("error", (err) => console.error("❌ MQTT error", err));
  }
  return client;
}
