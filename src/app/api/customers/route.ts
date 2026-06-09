import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCustomers, findOrCreateCustomer } from "@/server/services/customer-service";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const source = url.searchParams.get("source");
  const city = url.searchParams.get("city");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const result = await getCustomers(orgId, {
    search: search || undefined,
    source: source || undefined,
    city: city || undefined,
    limit,
    offset: (page - 1) * limit,
  });

  return NextResponse.json({
    success: true,
    data: result.customers,
    total: result.total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(result.total / limit),
  });
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

  const member = await (await import("@/server/db/prisma")).prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId: session.user.id } },
  });
  if (!member || member.role === "VIEWER") {
    return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
  }

  const body = await req.json();
  const customer = await findOrCreateCustomer({
    organizationId: orgId,
    phone: body.phone,
    name: body.name,
    email: body.email,
    source: body.source || "manual",
  });

  return NextResponse.json({ success: true, data: customer });
}
