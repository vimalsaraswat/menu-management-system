import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const menuRouter = createTRPCRouter({
  getBySlug: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return await ctx.db.restaurant.findUnique({
      where: { slug: input },
      select: {
        id: true,
        name: true,
        location: true,
        slug: true,
        categories: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            order: true,
            dishLinks: {
              select: {
                dish: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    imageUrl: true,
                    description: true,
                    isVegetarian: true,
                    spiceLevel: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }),

  getDishesByCategory: publicProcedure
    .input(
      z.object({
        restaurantSlug: z.string(),
        categoryId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.db.dish.findMany({
        where: {
          categories: { some: { categoryId: input.categoryId } },
        },
        include: { categories: true },
      });
    }),
});
