import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const requests = await prisma.clientRequest.findMany({
    include: {
      organization: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, data: requests });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const request = await prisma.clientRequest.create({
    data: {
      organizationId: body.organizationId,
      type: body.type,
      priority: body.priority || "normal",
      contactName: body.contactName,
      phone: body.phone,
      subject: body.subject,
      description: body.description,
      notes: body.notes,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, data: request });
}
