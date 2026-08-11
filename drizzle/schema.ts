import {
  bigint,
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  tagline: varchar("tagline", { length: 512 }),
  shortDescription: text("shortDescription"),
  description: text("description"),
  features: text("features"),
  useCases: text("useCases"),
  systemRequirements: text("systemRequirements"),
  version: varchar("version", { length: 64 }),
  platform: varchar("platform", { length: 128 }),
  categoryId: int("categoryId"),
  status: mysqlEnum("status", ["available", "coming_soon", "hidden"]).default("available").notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  iconUrl: text("iconUrl"),
  externalCheckoutUrl: text("externalCheckoutUrl"),
  supportUrl: text("supportUrl"),
  documentationUrl: text("documentationUrl"),
  refundPolicy: text("refundPolicy"),
  privacyInfo: text("privacyInfo"),
  metaTitle: varchar("metaTitle", { length: 256 }),
  metaDescription: text("metaDescription"),
  ogImage: text("ogImage"),
  currency: varchar("currency", { length: 8 }).default("GBP").notNull(),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }),
  discountType: mysqlEnum("discountType", ["none", "percentage", "fixed"]).default("none").notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }),
  discountExpiresAt: timestamp("discountExpiresAt"),
  viewCount: bigint("viewCount", { mode: "number" }).default(0).notNull(),
  buyClickCount: bigint("buyClickCount", { mode: "number" }).default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Product Images ───────────────────────────────────────────────────────────
export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  url: text("url").notNull(),
  fileKey: text("fileKey"),
  altText: varchar("altText", { length: 256 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId"),
  reviewerName: varchar("reviewerName", { length: 128 }),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 256 }),
  body: text("body"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "hidden"]).default("pending").notNull(),
  adminReply: text("adminReply"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId"),
  buyerEmail: varchar("buyerEmail", { length: 320 }),
  externalOrderId: varchar("externalOrderId", { length: 256 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("GBP").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

// ─── Analytics Events ─────────────────────────────────────────────────────────
export const analyticsEvents = mysqlTable("analytics_events", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  productId: int("productId"),
  path: varchar("path", { length: 512 }),
  referrer: varchar("referrer", { length: 512 }),
  sessionId: varchar("sessionId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
