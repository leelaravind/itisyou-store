import { and, desc, eq, ilike, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analyticsEvents,
  categories,
  InsertUser,
  orders,
  productImages,
  products,
  reviews,
  siteSettings,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const v = user[field];
    if (v !== undefined) { values[field] = v ?? null; updateSet[field] = v ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder);
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getProducts(opts?: {
  search?: string;
  categorySlug?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "featured";
  status?: "available" | "coming_soon" | "hidden" | "all";
}) {
  const db = await getDb();
  if (!db) return [];
  let q = db.select().from(products).$dynamic();
  const conditions = [];
  if (opts?.status && opts.status !== "all") {
    conditions.push(eq(products.status, opts.status));
  } else if (!opts?.status) {
    conditions.push(or(eq(products.status, "available"), eq(products.status, "coming_soon"))!);
  }
  if (opts?.search) {
    const term = `%${opts.search}%`;
    conditions.push(or(like(products.name, term), like(products.tagline, term), like(products.shortDescription, term))!);
  }
  if (opts?.categorySlug) {
    const cat = await db.select().from(categories).where(eq(categories.slug, opts.categorySlug)).limit(1);
    if (cat[0]) conditions.push(eq(products.categoryId, cat[0].id));
  }
  if (conditions.length > 0) q = q.where(and(...conditions));
  if (opts?.sort === "price_asc") q = q.orderBy(products.basePrice);
  else if (opts?.sort === "price_desc") q = q.orderBy(desc(products.basePrice));
  else if (opts?.sort === "featured") q = q.orderBy(desc(products.isFeatured), desc(products.createdAt));
  else q = q.orderBy(desc(products.createdAt));
  return q;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(and(eq(products.isFeatured, true), eq(products.status, "available"))).orderBy(desc(products.createdAt)).limit(6);
}

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(productImages.sortOrder);
}

export async function incrementProductView(productId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ viewCount: sql`${products.viewCount} + 1` }).where(eq(products.id, productId));
}

export async function incrementBuyClick(productId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ buyClickCount: sql`${products.buyClickCount} + 1` }).where(eq(products.id, productId));
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export async function getApprovedReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.status, "approved"))).orderBy(desc(reviews.createdAt));
}

export async function getAllReviews(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (productId) return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function getReviewRatingSummary(productId: number) {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };
  const result = await db.select({
    average: sql<number>`AVG(${reviews.rating})`,
    count: sql<number>`COUNT(*)`,
  }).from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")));
  return { average: Number(result[0]?.average ?? 0), count: Number(result[0]?.count ?? 0) };
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getRecentOrders(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function trackEvent(event: { eventType: string; productId?: number; path?: string; referrer?: string; sessionId?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values(event);
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return { totalViews: 0, totalBuyClicks: 0, totalProducts: 0, totalUsers: 0 };
  const [viewsResult, buyResult, productsResult, usersResult] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(analyticsEvents).where(eq(analyticsEvents.eventType, "page_view")),
    db.select({ count: sql<number>`COUNT(*)` }).from(analyticsEvents).where(eq(analyticsEvents.eventType, "buy_click")),
    db.select({ count: sql<number>`COUNT(*)` }).from(products),
    db.select({ count: sql<number>`COUNT(*)` }).from(users),
  ]);
  return {
    totalViews: Number(viewsResult[0]?.count ?? 0),
    totalBuyClicks: Number(buyResult[0]?.count ?? 0),
    totalProducts: Number(productsResult[0]?.count ?? 0),
    totalUsers: Number(usersResult[0]?.count ?? 0),
  };
}

export async function getTopProducts(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.viewCount)).limit(limit);
}

// ─── Site Settings ────────────────────────────────────────────────────────────
export async function getSiteSettings() {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function upsertSiteSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(siteSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}
