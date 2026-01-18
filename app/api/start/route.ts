export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { startSimulation as startBackendSimulation } from "../../../lib/mokaSimulator";
import { startSimulation as startFrontendSimulation } from "../../../lib/frontendSimulator";

export async function GET() {
  const useBackendSimulator = process.env.USE_BACKEND_SIMULATOR === "true";

  if (!useBackendSimulator) {
    // Frontend mode: run simulation on Next.js server with WebSocket MQTT
    console.log("▶️ /api/start (frontend mode)");
    startFrontendSimulation();
    return NextResponse.json({ status: "started (frontend mode)" });
  }

  // Backend mode: call the backend simulation function directly
  console.log("▶️ /api/start endpoint called (backend mode)");
  startBackendSimulation();
  console.log("▶️ /api/start returning response");
  return NextResponse.json({ status: "started (backend mode)" });
}
