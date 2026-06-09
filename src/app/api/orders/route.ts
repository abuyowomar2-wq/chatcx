import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrders } from "@/server/services/order-service";

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
  const status = url.searchParams.get("status");
  const customerId = url.searchParams.get("customerId");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const result = await getOrders(orgId, {
    search: search || undefined,
    status: status || undefined,
    customerId: customerId || undefined,
    limit,
    offset: (page - 1) * limit,
  });

  return NextResponse.json({
    success: true,
    data: result.orders,
    total: result.total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(result.total / limit),
  });
}
