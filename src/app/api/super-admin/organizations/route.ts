import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const organizations = await prisma.organization.findMany({
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 },
      sallaConnections: { select: { isConnected: true, lastSyncAt: true } },
      whatsappConnections: { select: { isConnected: true, webhookVerified: true } },
      _count: { select: { customers: true, conversations: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: organizations });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, action } = body;

  if (!id || !action) {
    return NextResponse.json({ success: false, error: "Missing id or action" }, { status: 400 });
  }

  switch (action) {
    case "suspend":
      await prisma.organization.update({ where: { id }, data: { isActive: false } });
      break;
    case "activate":
      await prisma.organization.update({ where: { id }, data: { isActive: true } });
      break;
    default:
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
