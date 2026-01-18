export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { resetSimulation } from "../../../lib/mokaSimulator";

export async function GET() {
  const useBackendSimulator = process.env.USE_BACKEND_SIMULATOR === "true";

  if (!useBackendSimulator) {
    return NextResponse.json(
      { error: "Backend simulator not enabled. Use frontend controls instead." },
      { status: 400 }
    );
  }

  console.log("🔄 /api/reset endpoint called");
  resetSimulation();
  console.log("🔄 /api/reset returning response");
  return NextResponse.json({ status: "reset" });
}
