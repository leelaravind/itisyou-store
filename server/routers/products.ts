import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getCategories,
  getFeaturedProducts,
  getProductBySlug,
  getProductImages,
  getProducts,
  incrementBuyClick,
  incrementProductView,
  trackEvent,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, productImages } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";

export const productsRouter = router({
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      categorySlug: z.string().optional(),
      sort: z.enum(["newest", "price_asc", "price_desc", "featured"]).optional(),
      status: z.enum(["available", "coming_soon", "hidden", "all"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      return getProducts(input ?? {});
    }),

  featured: publicProcedure.query(async () => {
    return getFeaturedProducts();
  }),

  categories: publicProcedure.query(async () => {
    return getCategories();
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const product = await getProductBySlug(input.slug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      // Track view
      await incrementProductView(product.id);
      await trackEvent({ eventType: "product_view", productId: product.id, path: `/products/${input.slug}` });
      const images = await getProductImages(product.id);
      return { ...product, images };
    }),

  trackBuyClick: publicProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input }) => {
      await incrementBuyClick(input.productId);
      await trackEvent({ eventType: "buy_click", productId: input.productId });
      return { success: true };
    }),

  // Admin procedures
  adminList: adminProcedure.query(async () => {
    return getProducts({ status: "all" });
  }),

  create: adminProcedure
    .input(z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      tagline: z.string().optional(),
      shortDescription: z.string().optional(),
      description: z.string().optional(),
      features: z.string().optional(),
      useCases: z.string().optional(),
      systemRequirements: z.string().optional(),
      version: z.string().optional(),
      platform: z.string().optional(),
      categoryId: z.number().optional(),
      status: z.enum(["available", "coming_soon", "hidden"]).default("available"),
      isFeatured: z.boolean().default(false),
      iconUrl: z.string().optional(),
      externalCheckoutUrl: z.string().optional(),
      supportUrl: z.string().optional(),
      documentationUrl: z.string().optional(),
      refundPolicy: z.string().optional(),
      privacyInfo: z.string().optional(),
      currency: z.string().default("GBP"),
      basePrice: z.string().optional(),
      discountType: z.enum(["none", "percentage", "fixed"]).default("none"),
      discountValue: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(products).values(input as any);
      return { success: true };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      slug: z.string().optional(),
      name: z.string().optional(),
      tagline: z.string().optional(),
      shortDescription: z.string().optional(),
      description: z.string().optional(),
      features: z.string().optional(),
      useCases: z.string().optional(),
      systemRequirements: z.string().optional(),
      version: z.string().optional(),
      platform: z.string().optional(),
      categoryId: z.number().optional(),
      status: z.enum(["available", "coming_soon", "hidden"]).optional(),
      isFeatured: z.boolean().optional(),
      iconUrl: z.string().optional(),
      externalCheckoutUrl: z.string().optional(),
      supportUrl: z.string().optional(),
      documentationUrl: z.string().optional(),
      refundPolicy: z.string().optional(),
      currency: z.string().optional(),
      basePrice: z.string().optional(),
      discountType: z.enum(["none", "percentage", "fixed"]).optional(),
      discountValue: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...data } = input;
      await db.update(products).set(data as any).where(eq(products.id, id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  uploadImage: adminProcedure
    .input(z.object({
      productId: z.number(),
      base64: z.string(),
      filename: z.string(),
      mimeType: z.string(),
      altText: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const buffer = Buffer.from(input.base64, "base64");
      const key = `products/${input.productId}/${Date.now()}-${input.filename}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await db.insert(productImages).values({ productId: input.productId, url, fileKey: key, altText: input.altText });
      return { url };
    }),
});
