import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { SPICE_LEVELS } from "../../../lib/constants";

export const dishRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        price: z.number().int().min(0),
        imageUrl: z.string().optional(),
        description: z.string().optional(),
        spiceLevel: z.enum(SPICE_LEVELS).optional(),
        isVegetarian: z.boolean().optional(),
        categoryIds: z.array(z.string()).min(1),
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

      const categories = await ctx.db.category.findMany({
        where: {
          id: { in: input.categoryIds },
          restaurantId: input.restaurantId,
        },
      });
      if (categories.length !== input.categoryIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid categories",
        });
      }

      const dish = await ctx.db.dish.create({
        data: {
          name: input.name,
          price: input.price,
          imageUrl: input.imageUrl,
          description: input.description,
          spiceLevel: input.spiceLevel,
          isVegetarian: input.isVegetarian ?? true,
        },
      });

      await ctx.db.dishCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({
          dishId: dish.id,
          categoryId,
        })),
      });

      return dish;
    }),

  list: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const restaurant = await ctx.db.restaurant.findUnique({
      where: { id: input },
    });
    if (!restaurant || restaurant.userId !== ctx.session.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return ctx.db.dish.findMany({
      where: {
        categories: { some: { category: { restaurantId: input } } },
      },
      include: { categories: { include: { category: true } } },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        imageUrl: z.string().optional(),
        description: z.string().optional(),
        spiceLevel: z
          .enum(["Mild", "Medium", "Spicy", "Very Spicy"])
          .optional(),
        categoryIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const dish = await ctx.db.dish.findUnique({ where: { id: input.id } });
      if (!dish) throw new TRPCError({ code: "NOT_FOUND" });

      const dc = await ctx.db.dishCategory.findFirst({
        where: { dishId: input.id },
        include: { category: true },
      });
      if (!dc) throw new TRPCError({ code: "BAD_REQUEST" });

      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: dc.category.restaurantId },
      });
      if (!restaurant || restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updatedDish = await ctx.db.dish.update({
        where: { id: input.id },
        data: input,
      });

      if (input.categoryIds) {
        await ctx.db.dishCategory.deleteMany({ where: { dishId: input.id } });
        await ctx.db.dishCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({
            dishId: input.id,
            categoryId,
          })),
        });
      }

      return updatedDish;
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const dish = await ctx.db.dish.findUnique({ where: { id: input } });
      if (!dish) throw new TRPCError({ code: "NOT_FOUND" });

      const dc = await ctx.db.dishCategory.findFirst({
        where: { dishId: input },
        include: { category: true },
      });
      if (!dc) throw new TRPCError({ code: "BAD_REQUEST" });

      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: dc.category.restaurantId },
      });
      if (!restaurant || restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.dishCategory.deleteMany({ where: { dishId: input } });
      return ctx.db.dish.delete({ where: { id: input } });
    }),
});
