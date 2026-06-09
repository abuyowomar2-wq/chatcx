import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const conn = await prisma.whatsAppConnection.findUnique({
    where: { organizationId: orgId },
    select: {
      isConnected: true,
      webhookVerified: true,
      phoneNumber: true,
      businessName: true,
      lastErrorAt: true,
      lastErrorMessage: true,
    },
  });

  return NextResponse.json({ success: true, data: conn || { isConnected: false } });
}
