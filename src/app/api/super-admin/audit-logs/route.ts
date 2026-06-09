import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ success: true, data: logs });
}
