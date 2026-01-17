import { NextResponse } from "next/server";
import { resetSimulation } from "../../../lib/mokaSimulator";

export const runtime = "nodejs";

export async function GET() {
  console.log("🔄 /api/reset endpoint called");
  resetSimulation();
  console.log("🔄 /api/reset returning response");
  return NextResponse.json({ status: "reset" });
}
