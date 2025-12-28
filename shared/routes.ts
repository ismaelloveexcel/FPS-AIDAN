import { z } from 'zod';
import { insertScoreSchema, scores, type InsertScore } from './schema';

export type { InsertScore };

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const meshyTextTo3DInputSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  negativePrompt: z.string().optional(),
  artStyle: z.enum(["realistic", "cartoon", "hand-painted", "fantasy", "sculpture"]).default("realistic"),
});

export const meshyImageTo3DInputSchema = z.object({
  imageUrl: z.string().url("Valid image URL is required"),
  enablePbr: z.boolean().default(true),
});

export const meshyTaskStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "SUCCEEDED", "FAILED"]),
  progress: z.number(),
  modelUrls: z.object({
    glb: z.string().optional(),
    fbx: z.string().optional(),
    obj: z.string().optional(),
    usdz: z.string().optional(),
  }).optional(),
});

export type MeshyTextTo3DInput = z.infer<typeof meshyTextTo3DInputSchema>;
export type MeshyImageTo3DInput = z.infer<typeof meshyImageTo3DInputSchema>;
export type MeshyTaskStatus = z.infer<typeof meshyTaskStatusSchema>;

export const api = {
  scores: {
    list: {
      method: 'GET' as const,
      path: '/api/scores',
      responses: {
        200: z.array(z.custom<typeof scores.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scores',
      input: insertScoreSchema,
      responses: {
        201: z.custom<typeof scores.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  meshy: {
    textTo3D: {
      method: 'POST' as const,
      path: '/api/meshy/text-to-3d',
      input: meshyTextTo3DInputSchema,
    },
    imageTo3D: {
      method: 'POST' as const,
      path: '/api/meshy/image-to-3d',
      input: meshyImageTo3DInputSchema,
    },
    taskStatus: {
      method: 'GET' as const,
      path: '/api/meshy/task/:taskId',
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
