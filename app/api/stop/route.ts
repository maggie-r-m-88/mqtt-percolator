import { NextResponse } from "next/server";
import { getMqttClient } from "../../../lib/mqttClient";

export async function GET() {
  const client = getMqttClient();

  console.log("⏹️ /api/stop called");

  client.publish("moka/control", "stop", { qos: 1, retain: false });

  return NextResponse.json({ status: "stop command sent" });
}
