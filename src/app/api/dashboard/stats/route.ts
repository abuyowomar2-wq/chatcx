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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    openConversations,
    unreadConversations,
    todayConversations,
    newCustomersToday,
    totalOrders,
    sallaConn,
    whatsappConn,
  ] = await Promise.all([
    prisma.conversation.count({ where: { organizationId: orgId, status: { not: "CLOSED" } } }),
    prisma.conversation.count({ where: { organizationId: orgId, unreadCount: { gt: 0 } } }),
    prisma.conversation.count({ where: { organizationId: orgId, createdAt: { gte: today } } }),
    prisma.customer.count({ where: { organizationId: orgId, createdAt: { gte: today } } }),
    prisma.order.count({ where: { organizationId: orgId } }),
    prisma.sallaConnection.findUnique({ where: { organizationId: orgId } }),
    prisma.whatsAppConnection.findUnique({ where: { organizationId: orgId } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalConversationsToday: todayConversations,
      openConversations,
      unreadConversations,
      avgResponseTime: 2.5,
      newCustomersToday,
      totalOrders,
      sallaConnected: sallaConn?.isConnected || false,
      whatsappConnected: whatsappConn?.isConnected || false,
    },
  });
}
