import { NextResponse } from "next/server";
import { getPlans } from "@/server/services/billing-service";

export async function GET() {
  const plans = await getPlans();
  return NextResponse.json({ success: true, data: plans });
}
