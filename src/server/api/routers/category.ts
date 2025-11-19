import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        restaurantId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: input.restaurantId },
      });
      if (!restaurant || restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.category.create({
        data: { ...input, restaurantId: input.restaurantId },
      });
    }),

  list: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const restaurant = await ctx.db.restaurant.findUnique({
      where: { id: input },
    });
    if (!restaurant || restaurant.userId !== ctx.session.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return ctx.db.category.findMany({
      where: { restaurantId: input },
      include: {
        dishLinks: {
          include: {
            dish: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
      });

      if (!category) throw new TRPCError({ code: "NOT_FOUND" });
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: category.restaurantId },
      });

      if (!restaurant || restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.category.update({
        where: { id: input.id },
        data: input,
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input },
      });
      if (!category) throw new TRPCError({ code: "NOT_FOUND" });

      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: category.restaurantId },
      });
      if (!restaurant || restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.dishCategory.deleteMany({ where: { categoryId: input } });
      return ctx.db.category.delete({ where: { id: input } });
    }),

  updateOrder: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        orders: z.array(z.string()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { restaurantId, orders } = input;
      await ctx.db.$transaction(async (tx) => {
        const existingCategories = await tx.category.findMany({
          where: { id: { in: orders }, restaurantId },
          select: { id: true },
        });
        if (existingCategories.length !== orders.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid category order",
          });
        }
        for (let i = 0; i < orders.length; i++) {
          await tx.category.update({
            where: { id: orders[i] },
            data: { order: i },
          });
        }
      });
      return { success: true };
    }),
});
