import { prisma } from "@/server/db/prisma";

export async function getPlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCurrentSubscription(organizationId: string) {
  return prisma.subscription.findFirst({
    where: { organizationId },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function checkSubscriptionActive(organizationId: string): Promise<boolean> {
  const sub = await getCurrentSubscription(organizationId);
  if (!sub) return false;

  if (sub.status === "ACTIVE" || sub.status === "TRIALING") {
    if (sub.currentPeriodEnd < new Date()) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "EXPIRED" },
      });
      return false;
    }
    return true;
  }

  return false;
}

export async function changePlan(organizationId: string, planId: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("الخطة غير موجودة");

  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  const existing = await getCurrentSubscription(organizationId);

  if (existing) {
    return prisma.subscription.update({
      where: { id: existing.id },
      data: {
        planId,
        currentPeriodEnd,
        status: "ACTIVE",
      },
    });
  }

  return prisma.subscription.create({
    data: {
      organizationId,
      planId,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd,
    },
  });
}

export async function createInvoice(data: {
  organizationId: string;
  planId?: string;
  amount: number;
  tax?: number;
  currency?: string;
  status?: string;
  dueDate: Date;
  notes?: string;
  createdById: string;
}) {
  const invoiceCount = await prisma.invoice.count();
  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${(invoiceCount + 1).toString().padStart(4, "0")}`;

  const total = data.amount + (data.tax || 0);

  return prisma.invoice.create({
    data: {
      organizationId: data.organizationId,
      invoiceNumber,
      planId: data.planId,
      amount: data.amount,
      tax: data.tax || 0,
      total,
      currency: data.currency || "SAR",
      status: data.status || "draft",
      dueDate: data.dueDate,
      notes: data.notes,
      createdById: data.createdById,
    },
  });
}

export async function getInvoices(organizationId: string) {
  return prisma.invoice.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMessageQuota(organizationId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const usage = await prisma.messageQuotaUsage.findUnique({
    where: {
      organizationId_month_year: { organizationId, month, year },
    },
  });

  const sub = await getCurrentSubscription(organizationId);

  return {
    used: usage?.count || 0,
    limit: sub?.plan.maxMessages || 0,
    planName: sub?.plan.name || "Free Trial",
  };
}

export async function incrementMessageQuota(organizationId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  await prisma.messageQuotaUsage.upsert({
    where: { organizationId_month_year: { organizationId, month, year } },
    update: { count: { increment: 1 } },
    create: { organizationId, month, year, count: 1 },
  });
}
