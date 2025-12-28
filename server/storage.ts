import { type Score, type InsertScore, scores, type GameAsset, type InsertGameAsset, gameAssets } from "@shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  getScores(): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  getGameAssets(): Promise<GameAsset[]>;
  getGameAssetByName(name: string): Promise<GameAsset | undefined>;
  getGameAssetsByCategory(category: string): Promise<GameAsset[]>;
  createGameAsset(asset: InsertGameAsset): Promise<GameAsset>;
  updateGameAsset(id: number, updates: Partial<InsertGameAsset>): Promise<GameAsset | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getScores(): Promise<Score[]> {
    return await db.select().from(scores).orderBy(desc(scores.score)).limit(10);
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const [score] = await db
      .insert(scores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getGameAssets(): Promise<GameAsset[]> {
    return await db.select().from(gameAssets).orderBy(desc(gameAssets.createdAt));
  }

  async getGameAssetByName(name: string): Promise<GameAsset | undefined> {
    const [asset] = await db.select().from(gameAssets).where(eq(gameAssets.name, name));
    return asset;
  }

  async getGameAssetsByCategory(category: string): Promise<GameAsset[]> {
    return await db.select().from(gameAssets).where(eq(gameAssets.category, category));
  }

  async createGameAsset(insertAsset: InsertGameAsset): Promise<GameAsset> {
    const [asset] = await db
      .insert(gameAssets)
      .values(insertAsset)
      .returning();
    return asset;
  }

  async updateGameAsset(id: number, updates: Partial<InsertGameAsset>): Promise<GameAsset | undefined> {
    const [asset] = await db
      .update(gameAssets)
      .set(updates)
      .where(eq(gameAssets.id, id))
      .returning();
    return asset;
  }
}

export const storage = new DatabaseStorage();
