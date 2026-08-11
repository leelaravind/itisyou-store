import { adminProcedure, router } from "../_core/trpc";
import { getAnalyticsSummary, getRecentOrders, getTopProducts } from "../db";

export const analyticsRouter = router({
  summary: adminProcedure.query(async () => {
    const [summary, topProducts, recentOrders] = await Promise.all([
      getAnalyticsSummary(),
      getTopProducts(5),
      getRecentOrders(10),
    ]);
    return { summary, topProducts, recentOrders };
  }),
});
