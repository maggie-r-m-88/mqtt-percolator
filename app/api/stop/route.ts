export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stopSimulation } from "../../../lib/mokaSimulator";

export async function GET() {
  stopSimulation();
  return NextResponse.json({ status: "stopped" });
}
