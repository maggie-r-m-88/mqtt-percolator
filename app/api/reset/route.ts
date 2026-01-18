import { NextResponse } from "next/server";
import { getMqttClient } from "../../../lib/mqttClient";

export async function GET() {
  const client = getMqttClient();

  console.log("🔄 /api/reset called");

  client.publish("moka/control", "reset", { qos: 1, retain: false });

  return NextResponse.json({ status: "reset command sent" });
}
