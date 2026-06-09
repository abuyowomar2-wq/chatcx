import { prisma } from "@/server/db/prisma";

export async function createNotification(data: {
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  type?: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      organizationId: data.organizationId,
      userId: data.userId,
      title: data.title,
      body: data.body,
      type: data.type || "info",
      link: data.link,
    },
  });
}

export async function notifyOrganization(organizationId: string, data: {
  title: string;
  body: string;
  type?: string;
  link?: string;
}) {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId, isActive: true },
  });

  return prisma.notification.createMany({
    data: members.map((m: any) => ({
      organizationId,
      userId: m.userId,
      title: data.title,
      body: data.body,
      type: data.type || "info",
      link: data.link,
    })),
  });
}

export async function getNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
