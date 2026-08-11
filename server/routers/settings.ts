import { z } from "zod";
import { getSiteSettings, upsertSiteSetting } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";

export const settingsRouter = router({
  get: publicProcedure.query(async () => {
    return getSiteSettings();
  }),
  set: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      await upsertSiteSetting(input.key, input.value);
      return { success: true };
    }),
});
