import { z } from 'zod';
import { insertScoreSchema, scores } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  scores: {
    list: {
      method: 'GET' as const,
      path: '/api/scores',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          score: z.number(),
          username: z.string().nullable(),
          createdAt: z.string().nullable(),
        })),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scores',
      input: insertScoreSchema,
      responses: {
        201: z.custom<typeof scores.$inferSelect>(),
        400: errorSchemas.validation,
        401: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ScoreInput = z.infer<typeof api.scores.create.input>;
export type ScoreResponse = z.infer<typeof api.scores.create.responses[201]>;
export type ScoresListResponse = z.infer<typeof api.scores.list.responses[200]>;
