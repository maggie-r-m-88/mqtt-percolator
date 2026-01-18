export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { resetSimulation as resetBackendSimulation } from "../../../lib/mokaSimulator";
import { resetSimulation as resetFrontendSimulation } from "../../../lib/frontendSimulator";

export async function GET() {
  const useBackendSimulator = process.env.USE_BACKEND_SIMULATOR === "true";

  if (!useBackendSimulator) {
    // Frontend mode: reset simulation on Next.js server
    console.log("🔄 /api/reset (frontend mode)");
    resetFrontendSimulation();
    return NextResponse.json({ status: "reset (frontend mode)" });
  }

  // Backend mode: call the backend simulation function directly
  console.log("🔄 /api/reset endpoint called (backend mode)");
  resetBackendSimulation();
  console.log("🔄 /api/reset returning response");
  return NextResponse.json({ status: "reset (backend mode)" });
}
