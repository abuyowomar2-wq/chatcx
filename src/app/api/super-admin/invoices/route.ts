import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { createInvoice } from "@/server/services/billing-service";

export async function GET() {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const invoices = await prisma.invoice.findMany({
    include: {
      organization: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, data: invoices });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const invoice = await createInvoice({
    organizationId: body.organizationId,
    planId: body.planId,
    amount: body.amount,
    tax: body.tax,
    status: body.status || "draft",
    dueDate: new Date(body.dueDate),
    notes: body.notes,
    createdById: session.user.id,
  });

  return NextResponse.json({ success: true, data: invoice });
}
