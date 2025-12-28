import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const MESHY_API_BASE = "https://api.meshy.ai";

async function meshyRequest(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) {
    throw new Error("MESHY_API_KEY is not configured");
  }

  const response = await fetch(`${MESHY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meshy API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.scores.list.path, async (req, res) => {
    const scores = await storage.getScores();
    res.json(scores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      const input = api.scores.create.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Meshy.ai Text to 3D endpoint
  app.post(api.meshy.textTo3D.path, async (req, res) => {
    try {
      const input = api.meshy.textTo3D.input.parse(req.body);
      
      const result = await meshyRequest("/openapi/v2/text-to-3d", {
        method: "POST",
        body: JSON.stringify({
          mode: "preview",
          prompt: input.prompt,
          negative_prompt: input.negativePrompt || "low quality, low resolution, low poly, ugly",
          art_style: input.artStyle,
          should_remesh: true,
        }),
      });

      res.json({ taskId: result.result });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      throw err;
    }
  });

  // Meshy.ai Image to 3D endpoint
  app.post(api.meshy.imageTo3D.path, async (req, res) => {
    try {
      const input = api.meshy.imageTo3D.input.parse(req.body);
      
      const result = await meshyRequest("/openapi/v1/image-to-3d", {
        method: "POST",
        body: JSON.stringify({
          image_url: input.imageUrl,
          enable_pbr: input.enablePbr,
          should_remesh: true,
          should_texture: true,
        }),
      });

      res.json({ taskId: result.result });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      throw err;
    }
  });

  // Meshy.ai Task Status endpoint
  app.get("/api/meshy/task/:taskId", async (req, res) => {
    try {
      const { taskId } = req.params;
      
      const result = await meshyRequest(`/openapi/v2/text-to-3d/${taskId}`, {
        method: "GET",
      });

      res.json({
        id: result.id,
        status: result.status,
        progress: result.progress || 0,
        modelUrls: result.model_urls,
        textureUrls: result.texture_urls,
        thumbnailUrl: result.thumbnail_url,
      });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      throw err;
    }
  });

  // Initialize seed data
  await seedDatabase();

  return httpServer;
}

// Seed function to be called from index.ts if needed, 
// or we can just let it be empty initially.
export async function seedDatabase() {
  const existingScores = await storage.getScores();
  if (existingScores.length === 0) {
    await storage.createScore({ username: "DevTeam", score: 1000 });
    await storage.createScore({ username: "PlayerOne", score: 500 });
    await storage.createScore({ username: "Newbie", score: 100 });
  }
}
