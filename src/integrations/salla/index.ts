import { prisma } from "@/server/db/prisma";
import { encrypt, decrypt } from "@/utils/crypto";

const SALLA_API_BASE = "https://api.salla.dev/admin/v2";

function getHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export class SallaIntegrationService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async getConnection() {
    const conn = await prisma.sallaConnection.findUnique({
      where: { organizationId: this.organizationId },
    });
    if (!conn) return null;

    return {
      ...conn,
      accessToken: decrypt(conn.accessToken),
      refreshToken: decrypt(conn.refreshToken),
    };
  }

  async getAccessToken(): Promise<string> {
    const conn = await this.getConnection();
    if (!conn) throw new Error("Salla not connected");

    if (new Date() >= conn.expiresAt) {
      return this.refreshAccessToken(conn.refreshToken);
    }

    return conn.accessToken;
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch("https://api.salla.dev/admin/v2/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SALLA_CLIENT_ID,
        client_secret: process.env.SALLA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) throw new Error("Failed to refresh Salla token");

    const data = await response.json();

    await prisma.sallaConnection.update({
      where: { organizationId: this.organizationId },
      data: {
        accessToken: encrypt(data.access_token),
        refreshToken: encrypt(data.refresh_token || refreshToken),
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    });

    return data.access_token;
  }

  async apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken();
    const response = await globalThis.fetch(`${SALLA_API_BASE}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(token), ...options.headers },
    });

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") || "5");
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return this.apiFetch(endpoint, options);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Salla API error: ${response.status}`);
    }

    return response.json();
  }

  async getCustomers(page = 1, limit = 100) {
    return this.apiFetch(`/customers?page=${page}&limit=${limit}`);
  }

  async getOrders(page = 1, limit = 100) {
    return this.apiFetch(`/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(orderId: string) {
    return this.apiFetch(`/orders/${orderId}`);
  }

  async getProducts(page = 1, limit = 100) {
    return this.apiFetch(`/products?page=${page}&limit=${limit}`);
  }

  async getStoreInfo() {
    return this.apiFetch("/store/info");
  }

  async disconnect() {
    try {
      const token = await this.getAccessToken();
      await fetch(`${SALLA_API_BASE}/oauth/token/revoke`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ token }),
      });
    } catch {
      // Ignore revoke errors
    }

    await prisma.sallaConnection.update({
      where: { organizationId: this.organizationId },
      data: { isConnected: false, accessToken: "", refreshToken: "" },
    });
  }
}

export async function handleSallaOAuthCallback(code: string, organizationId: string) {
  const response = await fetch("https://api.salla.dev/admin/v2/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SALLA_CLIENT_ID,
      client_secret: process.env.SALLA_CLIENT_SECRET,
      redirect_uri: process.env.SALLA_REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error_description || "Failed to get Salla token");
  }

  const data = await response.json();

  const sallaService = new SallaIntegrationService(organizationId);
  const storeInfo = await sallaService.apiFetch("/store/info");

  const existing = await prisma.sallaConnection.findUnique({
    where: { organizationId },
  });

  if (existing) {
    await prisma.sallaConnection.update({
      where: { organizationId },
      data: {
        accessToken: encrypt(data.access_token),
        refreshToken: encrypt(data.refresh_token),
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        merchantId: storeInfo.data?.merchant?.id,
        merchantName: storeInfo.data?.merchant?.name,
        storeUrl: storeInfo.data?.store?.url,
        scopes: data.scope,
        isConnected: true,
      },
    });
  } else {
    await prisma.sallaConnection.create({
      data: {
        organizationId,
        accessToken: encrypt(data.access_token),
        refreshToken: encrypt(data.refresh_token),
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        merchantId: storeInfo.data?.merchant?.id,
        merchantName: storeInfo.data?.merchant?.name,
        storeUrl: storeInfo.data?.store?.url,
        scopes: data.scope,
        isConnected: true,
      },
    });
  }

  return { merchantName: storeInfo.data?.merchant?.name };
}
