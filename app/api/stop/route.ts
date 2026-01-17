export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stopSimulation } from "../../../lib/mokaSimulator";

export async function GET() {
  console.log("🛑 /api/stop endpoint called");
  stopSimulation();
  console.log("🛑 /api/stop returning response");
  return NextResponse.json({ status: "stopped" });
}
