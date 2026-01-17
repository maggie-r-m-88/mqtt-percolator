import { NextResponse } from "next/server";
import { resetSimulation } from "../../../lib/mokaSimulator";

export const runtime = "nodejs";

export async function GET() {
  resetSimulation();
  return NextResponse.json({ status: "reset" });
}
