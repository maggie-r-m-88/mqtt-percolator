export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { startSimulation } from "../../../lib/mokaSimulator";

export async function GET() {
  const useBackendSimulator = process.env.USE_BACKEND_SIMULATOR === "true";

  if (!useBackendSimulator) {
    return NextResponse.json(
      { error: "Backend simulator not enabled. Use frontend controls instead." },
      { status: 400 }
    );
  }

  console.log("▶️ /api/start endpoint called");
  startSimulation();
  console.log("▶️ /api/start returning response");
  return NextResponse.json({ status: "started" });
}
