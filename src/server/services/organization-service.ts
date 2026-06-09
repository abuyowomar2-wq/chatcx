import { prisma } from "@/server/db/prisma";
import { OrgRole } from "@/generated/prisma";

export async function getOrganization(organizationId: string) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      sallaConnections: true,
      whatsappConnections: true,
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getOrganizationMembers(organizationId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationId, isActive: true },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, lastLoginAt: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function checkMemberRole(organizationId: string, userId: string): Promise<OrgRole | null> {
  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  return member?.role || null;
}

export async function requireRole(organizationId: string, userId: string, allowedRoles: OrgRole[]): Promise<boolean> {
  const role = await checkMemberRole(organizationId, userId);
  return role !== null && allowedRoles.includes(role);
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export function canManageTeam(role: OrgRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageBilling(role: OrgRole): boolean {
  return role === "OWNER";
}

export function canViewReports(role: OrgRole): boolean {
  return role !== "AGENT";
}

export function canManageIntegrations(role: OrgRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}
