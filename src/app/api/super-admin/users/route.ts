import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      organizationMembers: {
        include: { organization: { select: { id: true, name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, data: users });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, action } = body;

  if (action === "block") {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
  } else if (action === "unblock") {
    await prisma.user.update({ where: { id }, data: { isActive: true } });
  }

  return NextResponse.json({ success: true });
}
