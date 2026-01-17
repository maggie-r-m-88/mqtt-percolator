export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { startSimulation } from "../../../lib/mokaSimulator";

export async function GET() {
  console.log("▶️ /api/start endpoint called");
  startSimulation();
  console.log("▶️ /api/start returning response");
  return NextResponse.json({ status: "started" });
}
