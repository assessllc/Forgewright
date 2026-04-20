import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { knowledgeRouter } from "./routers/knowledge";
import { sessionsRouter } from "./routers/sessions";
import { scaffoldRouter } from "./routers/scaffold";
import { analysisRouter } from "./routers/analysis";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  knowledge: knowledgeRouter,
  sessions: sessionsRouter,
  scaffold: scaffoldRouter,
  analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;
