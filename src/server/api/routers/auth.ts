import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { signJWT } from "~/lib/jwt";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { sendOtpEmail, verifyOtp } from "~/server/actions/otp";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        country: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
      });
      if (existing) throw new TRPCError({ code: "CONFLICT" });

      await sendOtpEmail(input.email);
      return { message: "Code sent" };
    }),

  verifyAndCreate: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
        name: z.string(),
        country: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!(await verifyOtp(input.email, input.code))) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await ctx.db.user.create({
        data: { email: input.email, name: input.name, country: input.country },
      });

      const token = await signJWT({ userId: user.id, email: user.email });
      return {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      };
    }),

  login: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      await sendOtpEmail(input.email);
      return { message: "Code sent" };
    }),

  verifyLogin: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string().length(6) }))
    .mutation(async ({ input, ctx }) => {
      if (!(await verifyOtp(input.email, input.code))) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      console.log(
        "user???>>>",
        user,
        input.email,
        await ctx.db.user.findMany(),
      );
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const token = await signJWT({ userId: user.id, email: user.email });

      return {
        token,
        user: { id: user.id, name: user.name, email: user.email },
      };
    }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    return {
      data: ctx.session,
    };
  }),
});
