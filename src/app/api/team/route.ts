import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { v4 as uuidv4 } from "uuid";
import { createAuditLog } from "@/server/services/audit-log-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: orgId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, lastLoginAt: true, isActive: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: members });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId: session.user.id } },
  });

  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, role } = body;

  if (!email || !role) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const alreadyMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: existingUser.id } },
    });
    if (alreadyMember) {
      return NextResponse.json({ success: false, error: "User is already a member" }, { status: 409 });
    }

    await prisma.organizationMember.create({
      data: { organizationId: orgId, userId: existingUser.id, role },
    });

    await createAuditLog({
      organizationId: orgId,
      userId: session.user.id,
      action: "ADD_MEMBER",
      entityType: "USER",
      entityId: existingUser.id,
      metadata: { role },
    });

    return NextResponse.json({ success: true });
  }

  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.invitation.create({
    data: {
      organizationId: orgId,
      email,
      role,
      token,
      invitedById: session.user.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Invitation sent",
    data: { token },
  });
}
