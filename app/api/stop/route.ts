export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stopSimulation as stopBackendSimulation } from "../../../lib/mokaSimulator";
import { stopSimulation as stopFrontendSimulation } from "../../../lib/frontendSimulator";

export async function GET() {
  const useBackendSimulator = process.env.USE_BACKEND_SIMULATOR === "true";

  if (!useBackendSimulator) {
    // Frontend mode: stop simulation on Next.js server
    console.log("🛑 /api/stop (frontend mode)");
    stopFrontendSimulation();
    return NextResponse.json({ status: "stopped (frontend mode)" });
  }

  // Backend mode: call the backend simulation function directly
  console.log("🛑 /api/stop endpoint called (backend mode)");
  stopBackendSimulation();
  console.log("🛑 /api/stop returning response");
  return NextResponse.json({ status: "stopped (backend mode)" });
}
