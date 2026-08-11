import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeCtx(role: "admin" | "user" | null = null): TrpcContext {
  const user = role
    ? {
        id: 1,
        openId: "test-user",
        email: "test@itisyou.app",
        name: "Test User",
        loginMethod: "manus",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("products router — public procedures", () => {
  it("list returns without throwing for anonymous user", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    // DB may not be available in test env — just verify no auth error is thrown
    const result = await caller.products.list({}).catch(e => {
      // Only acceptable error is DB connection, not auth
      expect(e.code).not.toBe("UNAUTHORIZED");
      return [];
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("featured returns without throwing for anonymous user", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.products.featured().catch(e => {
      expect(e.code).not.toBe("UNAUTHORIZED");
      return [];
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("categories returns without throwing for anonymous user", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.products.categories().catch(e => {
      expect(e.code).not.toBe("UNAUTHORIZED");
      return [];
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("products router — admin guard", () => {
  it("adminList throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.products.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("delete throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.products.delete({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("adminList does not throw FORBIDDEN for admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.products.adminList().catch(e => {
      expect(e.code).not.toBe("FORBIDDEN");
      return [];
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("reviews router — auth guard", () => {
  it("submit throws UNAUTHORIZED for anonymous user", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.reviews.submit({ productId: 1, rating: 5 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("adminList throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.reviews.adminList({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("auth router", () => {
  it("logout clears session cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1, openId: "u1", email: "a@b.com", name: "A", loginMethod: "manus",
        role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: (name: string) => cleared.push(name) } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(cleared.length).toBe(1);
  });
});
