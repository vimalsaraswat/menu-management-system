import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const restaurantRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        location: z.string().min(1),
        slug: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.restaurant.findUnique({
        where: { slug: input.slug },
      });
      if (existing)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Slug already taken",
        });

      return ctx.db.restaurant.create({
        data: { ...input, userId: ctx.session.user.id },
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.restaurant.findMany({
      where: { userId: ctx.session.user.id },
      include: { categories: true },
    });
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return ctx.db.restaurant.findUnique({ where: { id: input } });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: input.id },
      });
      if (!restaurant || restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (input.slug && input.slug !== restaurant.slug) {
        const existingSlug = await ctx.db.restaurant.findUnique({
          where: { slug: input.slug },
        });
        if (existingSlug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug already taken",
          });
        }
      }

      const { id, ...updateData } = input;

      return ctx.db.restaurant.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: input },
      });
      if (!restaurant || restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.db.restaurant.delete({ where: { id: input } });
    }),
});
