import { prisma } from "@/server/db/prisma";
import { normalizePhoneNumber } from "@/utils/phone";

export async function getCustomers(organizationId: string, params: {
  search?: string;
  source?: string;
  city?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = { organizationId, deletedAt: null };

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { phone: { contains: params.search } },
      { normalizedPhone: { contains: params.search } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.source) where.source = params.source;
  if (params.city) where.city = { contains: params.city, mode: "insensitive" };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        _count: { select: { orders: true, conversations: true } },
      },
      orderBy: { createdAt: "desc" },
      take: params.limit || 50,
      skip: params.offset || 0,
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total };
}

export async function getCustomer(id: string, organizationId: string) {
  return prisma.customer.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: {
      tags: { include: { tag: true } },
      orders: {
        orderBy: { orderedAt: "desc" },
        take: 10,
      },
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 10,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      identities: true,
    },
  });
}

export async function findOrCreateCustomer(data: {
  organizationId: string;
  phone?: string;
  name?: string;
  email?: string;
  source?: string;
  externalSallaId?: string;
}) {
  const normalizedPhone = data.phone ? normalizePhoneNumber(data.phone) : undefined;

  if (normalizedPhone) {
    const existing = await prisma.customer.findUnique({
      where: {
        organizationId_normalizedPhone: {
          organizationId: data.organizationId,
          normalizedPhone,
        },
      },
    });
    if (existing) return existing;
  }

  if (data.externalSallaId) {
    const existing = await prisma.customer.findUnique({
      where: {
        organizationId_externalSallaId: {
          organizationId: data.organizationId,
          externalSallaId: data.externalSallaId,
        },
      },
    });
    if (existing) return existing;
  }

  return prisma.customer.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      phone: data.phone,
      normalizedPhone,
      email: data.email,
      source: data.source || "whatsapp",
      firstSeenAt: new Date(),
    },
  });
}

export async function updateCustomer(id: string, organizationId: string, data: {
  name?: string;
  email?: string;
  city?: string;
  notes?: string;
  tags?: string[];
}) {
  const customer = await prisma.customer.findFirst({
    where: { id, organizationId },
  });
  if (!customer) return null;

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  if (data.tags) {
    await prisma.customerTag.deleteMany({ where: { customerId: id } });
    for (const tagName of data.tags) {
      const tag = await prisma.tag.upsert({
        where: { organizationId_name: { organizationId, name: tagName } },
        update: {},
        create: { organizationId, name: tagName },
      });
      await prisma.customerTag.create({ data: { customerId: id, tagId: tag.id } });
    }
  }

  return updated;
}

export async function mergeDuplicates(organizationId: string, phone: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const customers = await prisma.customer.findMany({
    where: { organizationId, normalizedPhone },
    orderBy: { createdAt: "asc" },
  });

  if (customers.length <= 1) return;

  const [primary, ...duplicates] = customers;

  for (const dup of duplicates) {
    await prisma.conversation.updateMany({
      where: { customerId: dup.id },
      data: { customerId: primary.id },
    });
    await prisma.order.updateMany({
      where: { customerId: dup.id },
      data: { customerId: primary.id },
    });
    await prisma.customerTag.updateMany({
      where: { customerId: dup.id },
      data: { customerId: primary.id },
    });

    await prisma.customer.update({
      where: { id: dup.id },
      data: { deletedAt: new Date() },
    });
  }
}
