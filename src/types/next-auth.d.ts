import "next-auth";
import type { OrgRole } from "@/generated/prisma";

declare module "next-auth" {
  interface User {
    isSuperAdmin?: boolean;
    organizations?: {
      id: string;
      role: OrgRole;
      name: string;
      slug: string;
    }[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isSuperAdmin: boolean;
      organizations: {
        id: string;
        role: OrgRole;
        name: string;
        slug: string;
      }[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isSuperAdmin: boolean;
    organizations: {
      id: string;
      role: OrgRole;
      name: string;
      slug: string;
    }[];
  }
}
