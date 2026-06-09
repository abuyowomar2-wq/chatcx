import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentSubscription, changePlan } from "@/server/services/billing-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const subscription = await getCurrentSubscription(orgId);
  return NextResponse.json({ success: true, data: subscription });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const member = await (await import("@/server/db/prisma")).prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId: session.user.id } },
  });

  if (member?.role !== "OWNER") {
    return NextResponse.json({ success: false, error: "Only owner can change plan" }, { status: 403 });
  }

  const body = await req.json();
  const { planId } = body;

  if (!planId) {
    return NextResponse.json({ success: false, error: "Missing planId" }, { status: 400 });
  }

  try {
    const subscription = await changePlan(orgId, planId);
    return NextResponse.json({ success: true, data: subscription });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
