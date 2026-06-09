import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SallaIntegrationService } from "@/integrations/salla";
import { findOrCreateCustomer } from "@/server/services/customer-service";
import { createOrUpdateOrder } from "@/server/services/order-service";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  try {
    const sallaService = new SallaIntegrationService(orgId);

    // Sync customers
    const customersData = await sallaService.getCustomers(1, 200);
    if (customersData?.data) {
      for (const c of customersData.data) {
        await findOrCreateCustomer({
          organizationId: orgId,
          phone: c.mobile,
          name: `${c.first_name} ${c.last_name}`,
          email: c.email,
          source: "salla",
          externalSallaId: String(c.id),
        });
      }
    }

    // Sync orders
    const ordersData = await sallaService.getOrders(1, 200);
    if (ordersData?.data) {
      for (const o of ordersData.data) {
        const customer = await findOrCreateCustomer({
          organizationId: orgId,
          phone: o.customer?.mobile,
          name: `${o.customer?.first_name || ""} ${o.customer?.last_name || ""}`,
          email: o.customer?.email,
          source: "salla",
          externalSallaId: String(o.customer?.id),
        });

        await createOrUpdateOrder({
          organizationId: orgId,
          customerId: customer.id,
          externalSallaId: String(o.id),
          orderNumber: o.reference_id || String(o.id),
          status: o.status?.name || "pending",
          total: parseFloat(o.amount) || 0,
          currency: o.currency || "SAR",
          paymentMethod: o.payment_method?.name,
          orderedAt: o.date,
          items: o.items?.map((item: any) => ({
            name: item.name,
            quantity: item.quantity || 1,
            unitPrice: parseFloat(item.price) || 0,
            totalPrice: parseFloat(item.total) || 0,
            sku: item.sku,
            imageUrl: item.image,
          })),
        });
      }
    }

    // Update sync status
    const { prisma } = await import("@/server/db/prisma");
    await prisma.sallaConnection.update({
      where: { organizationId: orgId },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({ success: true, message: "Sync completed" });
  } catch (err: any) {
    await (await import("@/server/db/prisma")).prisma.sallaConnection.update({
      where: { organizationId: orgId },
      data: { lastErrorAt: new Date(), lastErrorMessage: err.message },
    });

    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
