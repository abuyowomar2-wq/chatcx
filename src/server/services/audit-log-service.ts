import { prisma } from "@/server/db/prisma";

interface CreateAuditLogParams {
  organizationId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as any,
        ip: params.ip,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogs(params: {
  organizationId?: string;
  userId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}) {
  return prisma.auditLog.findMany({
    where: {
      ...(params.organizationId && { organizationId: params.organizationId }),
      ...(params.userId && { userId: params.userId }),
      ...(params.action && { action: params.action }),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: params.limit || 50,
    skip: params.offset || 0,
  });
}
