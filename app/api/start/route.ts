export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { startSimulation } from "../../../lib/mokaSimulator";

export async function GET() {
  startSimulation();
  return NextResponse.json({ status: "started" });
}
