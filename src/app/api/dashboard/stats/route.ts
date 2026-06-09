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
    recentConversations,
    messages,
  ] = await Promise.all([
    prisma.conversation.count({ where: { organizationId: orgId, status: { not: "CLOSED" } } }),
    prisma.conversation.count({ where: { organizationId: orgId, unreadCount: { gt: 0 } } }),
    prisma.conversation.count({ where: { organizationId: orgId, createdAt: { gte: today } } }),
    prisma.customer.count({ where: { organizationId: orgId, createdAt: { gte: today } } }),
    prisma.order.count({ where: { organizationId: orgId } }),
    prisma.sallaConnection.findUnique({ where: { organizationId: orgId } }),
    prisma.whatsAppConnection.findUnique({ where: { organizationId: orgId } }),
    prisma.conversation.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: { customer: { select: { name: true } } },
      orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
      take: 5,
    }),
    prisma.message.findMany({
      where: { organizationId: orgId, direction: "OUTBOUND" },
      select: { createdAt: true, conversationId: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  let avgResponseTimeMinutes = 0;
  if (messages.length > 0) {
    const responses = messages.filter((m) => m.createdAt != null);
    if (responses.length > 0) {
      const now = Date.now();
      const avgMs = responses.reduce((sum, msg) => {
        const diff = now - msg.createdAt.getTime();
        return sum + Math.min(diff, 3600000);
      }, 0) / responses.length;
      avgResponseTimeMinutes = avgMs / 60000;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      openConversations,
      unreadConversations,
      totalConversationsToday: todayConversations,
      newCustomersToday,
      totalOrders,
      sallaConnected: sallaConn?.isConnected || false,
      whatsappConnected: whatsappConn?.isConnected || false,
      avgResponseTimeMinutes,
      recentConversations: recentConversations.map((c) => ({
        id: c.id,
        customerName: c.customer?.name,
        lastMessagePreview: c.lastMessagePreview,
        lastMessageAt: c.lastMessageAt?.toISOString() || null,
      })),
    },
  });
}
