import { prisma } from "@/server/db/prisma";
import type { ConversationStatus, MessageDirection, MessageSource, MessageStatus } from "@/generated/prisma";

export async function getConversations(organizationId: string, params: {
  status?: ConversationStatus;
  assignedAgentId?: string;
  unassigned?: boolean;
  customerId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = { organizationId, deletedAt: null };

  if (params.status) where.status = params.status;
  if (params.assignedAgentId) where.assignedAgentId = params.assignedAgentId;
  if (params.unassigned) where.assignedAgentId = null;
  if (params.customerId) where.customerId = params.customerId;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true, normalizedPhone: true } },
        assignedAgent: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        _count: { select: { messages: true, internalNotes: true } },
      },
      orderBy: params.status === "CLOSED"
        ? { updatedAt: "desc" }
        : [{ lastMessageAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take: params.limit || 50,
      skip: params.offset || 0,
    }),
    prisma.conversation.count({ where }),
  ]);

  return { conversations, total };
}

export async function getConversation(id: string, organizationId: string) {
  return prisma.conversation.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: {
      customer: true,
      assignedAgent: { select: { id: true, name: true, email: true } },
      tags: { include: { tag: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true } },
          attachments: true,
        },
      },
      internalNotes: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function createConversation(data: {
  organizationId: string;
  customerId: string;
  assignedAgentId?: string;
  channel?: string;
  source?: string;
  subject?: string;
}) {
  return prisma.conversation.create({
    data: {
      organizationId: data.organizationId,
      customerId: data.customerId,
      assignedAgentId: data.assignedAgentId,
      channel: data.channel || "whatsapp",
      source: data.source || "whatsapp",
      subject: data.subject,
    },
  });
}

export async function createMessage(data: {
  organizationId: string;
  conversationId: string;
  senderId?: string;
  customerId?: string;
  direction: MessageDirection;
  source: MessageSource;
  body: string;
  mediaUrl?: string;
  mediaType?: string;
  status?: MessageStatus;
  externalMsgId?: string;
  isAiSuggested?: boolean;
  isAiSent?: boolean;
}) {
  const message = await prisma.message.create({
    data: {
      organizationId: data.organizationId,
      conversationId: data.conversationId,
      senderId: data.senderId,
      customerId: data.customerId,
      direction: data.direction,
      source: data.source,
      body: data.body,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      status: data.status || "SENT",
      externalMsgId: data.externalMsgId,
      isAiSuggested: data.isAiSuggested || false,
      isAiSent: data.isAiSent || false,
    },
  });

  await prisma.conversation.update({
    where: { id: data.conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: data.body.substring(0, 100),
      ...(data.direction === "INBOUND" ? { unreadCount: { increment: 1 } } : {}),
    },
  });

  return message;
}

export async function assignConversation(conversationId: string, agentId: string, organizationId: string) {
  return prisma.conversation.updateMany({
    where: { id: conversationId, organizationId },
    data: { assignedAgentId: agentId },
  });
}

export async function closeConversation(conversationId: string, userId: string, organizationId: string) {
  return prisma.conversation.updateMany({
    where: { id: conversationId, organizationId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      closedById: userId,
    },
  });
}

export async function addInternalNote(data: {
  organizationId: string;
  conversationId: string;
  authorId: string;
  body: string;
}) {
  return prisma.internalNote.create({ data });
}

export async function getUnreadCount(organizationId: string) {
  return prisma.conversation.count({
    where: { organizationId, status: { not: "CLOSED" }, unreadCount: { gt: 0 } },
  });
}

export async function getActiveConversationsCount(organizationId: string) {
  return prisma.conversation.count({
    where: { organizationId, status: { not: "CLOSED" } },
  });
}
