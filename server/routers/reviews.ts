import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getAllReviews, getApprovedReviews, getDb, getReviewRatingSummary } from "../db";
import { reviews } from "../../drizzle/schema";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const reviewsRouter = router({
  forProduct: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const [list, summary] = await Promise.all([
        getApprovedReviews(input.productId),
        getReviewRatingSummary(input.productId),
      ]);
      return { reviews: list, summary };
    }),

  submit: protectedProcedure
    .input(z.object({
      productId: z.number(),
      rating: z.number().min(1).max(5),
      title: z.string().max(256).optional(),
      body: z.string().max(4000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(reviews).values({
        productId: input.productId,
        userId: ctx.user.id,
        reviewerName: ctx.user.name ?? "Anonymous",
        reviewerEmail: ctx.user.email ?? undefined,
        rating: input.rating,
        title: input.title,
        body: input.body,
        status: "pending",
      });
      return { success: true };
    }),

  // Admin
  adminList: adminProcedure
    .input(z.object({ productId: z.number().optional() }))
    .query(async ({ input }) => {
      return getAllReviews(input.productId);
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "rejected", "hidden"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(reviews).set({ status: input.status }).where(eq(reviews.id, input.id));
      return { success: true };
    }),

  reply: adminProcedure
    .input(z.object({ id: z.number(), reply: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(reviews).set({ adminReply: input.reply }).where(eq(reviews.id, input.id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(reviews).where(eq(reviews.id, input.id));
      return { success: true };
    }),
});
