import { prisma } from "@/server/db/prisma";

export async function getOrders(organizationId: string, params: {
  search?: string;
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = { organizationId };

  if (params.search) {
    where.OR = [
      { orderNumber: { contains: params.search, mode: "insensitive" } },
      { customer: { phone: { contains: params.search } } },
      { customer: { normalizedPhone: { contains: params.search } } },
    ];
  }
  if (params.status) where.status = params.status;
  if (params.customerId) where.customerId = params.customerId;
  if (params.dateFrom || params.dateTo) {
    where.orderedAt = {};
    if (params.dateFrom) where.orderedAt.gte = new Date(params.dateFrom);
    if (params.dateTo) where.orderedAt.lte = new Date(params.dateTo);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: true,
      },
      orderBy: { orderedAt: "desc" },
      take: params.limit || 50,
      skip: params.offset || 0,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total };
}

export async function getOrder(id: string, organizationId: string) {
  return prisma.order.findFirst({
    where: { id, organizationId },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });
}

export async function createOrUpdateOrder(data: {
  organizationId: string;
  customerId: string;
  externalSallaId?: string;
  orderNumber?: string;
  status?: string;
  subtotal?: number;
  total?: number;
  discountAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  currency?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingAddress?: string;
  notes?: string;
  sallaOrderUrl?: string;
  orderedAt?: string;
  items?: { name: string; quantity: number; unitPrice: number; totalPrice: number; sku?: string; imageUrl?: string }[];
}) {
  const orderData: any = {
    organizationId: data.organizationId,
    customerId: data.customerId,
    externalSallaId: data.externalSallaId,
    orderNumber: data.orderNumber,
    status: data.status || "pending",
    subtotal: data.subtotal || 0,
    total: data.total || 0,
    discountAmount: data.discountAmount || 0,
    shippingAmount: data.shippingAmount || 0,
    taxAmount: data.taxAmount || 0,
    currency: data.currency || "SAR",
    paymentMethod: data.paymentMethod,
    shippingMethod: data.shippingMethod,
    shippingAddress: data.shippingAddress,
    notes: data.notes,
    sallaOrderUrl: data.sallaOrderUrl,
    orderedAt: data.orderedAt ? new Date(data.orderedAt) : new Date(),
  };

  if (data.externalSallaId) {
    const existing = await prisma.order.findUnique({
      where: {
        organizationId_externalSallaId: {
          organizationId: data.organizationId,
          externalSallaId: data.externalSallaId,
        },
      },
      include: { items: true },
    });

    if (existing) {
      await prisma.orderItem.deleteMany({ where: { orderId: existing.id } });
      if (data.items) {
        await prisma.orderItem.createMany({
          data: data.items.map((item) => ({
            orderId: existing.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            sku: item.sku,
            imageUrl: item.imageUrl,
          })),
        });
      }
      return prisma.order.update({ where: { id: existing.id }, data: orderData, include: { items: true } });
    }
  }

  const order = await prisma.order.create({ data: orderData });

  if (data.items) {
    await prisma.orderItem.createMany({
      data: data.items.map((item) => ({
        orderId: order.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        sku: item.sku,
        imageUrl: item.imageUrl,
      })),
    });
  }

  await prisma.customer.update({
    where: { id: data.customerId },
    data: {
      totalOrders: { increment: 1 },
      totalSpent: { increment: orderData.total },
      lastOrderAt: orderData.orderedAt,
    },
  });

  return prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
}
