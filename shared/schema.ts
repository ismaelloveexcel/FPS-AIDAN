import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScoreSchema = createInsertSchema(scores).omit({ 
  id: true, 
  createdAt: true 
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;

// Game asset types for Meshy-generated models
export const gameAssets = pgTable("game_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'enemy', 'environment', 'weapon', 'powerup'
  prompt: text("prompt").notNull(),
  meshyTaskId: text("meshy_task_id"),
  status: text("status").notNull().default("pending"), // 'pending', 'generating', 'completed', 'failed'
  modelUrl: text("model_url"),
  thumbnailUrl: text("thumbnail_url"),
  localPath: text("local_path"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameAssetSchema = createInsertSchema(gameAssets).omit({
  id: true,
  createdAt: true,
});

export type GameAsset = typeof gameAssets.$inferSelect;
export type InsertGameAsset = z.infer<typeof insertGameAssetSchema>;
