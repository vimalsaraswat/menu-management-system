import { authRouter } from "~/server/api/routers/auth";
import { categoryRouter } from "~/server/api/routers/category";
import { dishRouter } from "~/server/api/routers/dish";
import { menuRouter } from "~/server/api/routers/menu";
import { restaurantRouter } from "~/server/api/routers/restaurant";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  restaurant: restaurantRouter,
  category: categoryRouter,
  dish: dishRouter,
  menu: menuRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
