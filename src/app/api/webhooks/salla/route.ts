import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { createOrUpdateOrder } from "@/server/services/order-service";
import { findOrCreateCustomer, mergeDuplicates } from "@/server/services/customer-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get("x-salla-signature");

    const eventType = body.event || body.type;
    const eventId = body.id || body.event_id;
    const merchantId = body.merchant || body.data?.merchant?.id;

    const connection = await prisma.sallaConnection.findFirst({
      where: { merchantId },
    });

    if (!connection) {
      return NextResponse.json({ success: false, error: "Unknown merchant" }, { status: 404 });
    }

    const idempotencyKey = `salla:${eventType}:${eventId}`;
    const existing = await prisma.webhookEvent.findFirst({
      where: { idempotencyKey },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        organizationId: connection.organizationId,
        provider: "SALLA",
        externalEventId: eventId,
        eventType,
        payload: body as any,
        status: "received",
        idempotencyKey,
      },
    });

    try {
      switch (eventType) {
        case "order.created":
        case "order.updated":
        case "order.status.updated": {
          const orderData = body.data || body.order;
          const customerData = orderData?.customer;

          if (customerData) {
            const customer = await findOrCreateCustomer({
              organizationId: connection.organizationId,
              phone: customerData.mobile,
              name: `${customerData.first_name || ""} ${customerData.last_name || ""}`,
              email: customerData.email,
              source: "salla",
              externalSallaId: String(customerData.id),
            });

            await createOrUpdateOrder({
              organizationId: connection.organizationId,
              customerId: customer.id,
              externalSallaId: String(orderData.id),
              orderNumber: orderData.reference_id || String(orderData.id),
              status: orderData.status?.name || "pending",
              total: parseFloat(orderData.amount) || 0,
              currency: orderData.currency || "SAR",
              paymentMethod: orderData.payment_method?.name,
              orderedAt: orderData.date,
              items: orderData.items?.map((item: any) => ({
                name: item.name,
                quantity: item.quantity || 1,
                unitPrice: parseFloat(item.price) || 0,
                totalPrice: parseFloat(item.total) || 0,
                sku: item.sku,
                imageUrl: item.image,
              })),
            });
          }
          break;
        }

        case "customer.created":
        case "customer.updated": {
          const custData = body.data || body.customer;
          await findOrCreateCustomer({
            organizationId: connection.organizationId,
            phone: custData.mobile,
            name: `${custData.first_name || ""} ${custData.last_name || ""}`,
            email: custData.email,
            source: "salla",
            externalSallaId: String(custData.id),
          });
          break;
        }

        case "app.uninstalled": {
          await prisma.sallaConnection.update({
            where: { organizationId: connection.organizationId },
            data: { isConnected: false },
          });
          break;
        }
      }

      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: "processed", processedAt: new Date() },
      });
    } catch (err: any) {
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: "failed", errorMessage: err.message, retryCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Salla webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
