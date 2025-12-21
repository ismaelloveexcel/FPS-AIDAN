import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
