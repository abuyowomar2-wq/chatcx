import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const [totalOrganizations, totalUsers, activeSubscriptions, totalMessages] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: { in: ["ACTIVE", "TRIALING"] } } }),
    prisma.message.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: { totalOrganizations, totalUsers, activeSubscriptions, totalMessages },
  });
}
