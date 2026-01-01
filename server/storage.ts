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

// In-memory storage fallback when no database is available
export class MemoryStorage implements IStorage {
  private scores: Score[] = [
    { id: 1, username: "DevTeam", score: 1000, createdAt: new Date() },
    { id: 2, username: "PlayerOne", score: 500, createdAt: new Date() },
    { id: 3, username: "Newbie", score: 100, createdAt: new Date() },
  ];
  private nextScoreId = 4;
  private gameAssets: GameAsset[] = [];
  private nextAssetId = 1;

  async getScores(): Promise<Score[]> {
    return [...this.scores].sort((a, b) => b.score - a.score).slice(0, 10);
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const score: Score = {
      id: this.nextScoreId++,
      ...insertScore,
      createdAt: new Date(),
    };
    this.scores.push(score);
    return score;
  }

  async getGameAssets(): Promise<GameAsset[]> {
    return [...this.gameAssets].sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getGameAssetByName(name: string): Promise<GameAsset | undefined> {
    return this.gameAssets.find(a => a.name === name);
  }

  async getGameAssetsByCategory(category: string): Promise<GameAsset[]> {
    return this.gameAssets.filter(a => a.category === category);
  }

  async createGameAsset(insertAsset: InsertGameAsset): Promise<GameAsset> {
    const asset: GameAsset = {
      id: this.nextAssetId++,
      name: insertAsset.name,
      category: insertAsset.category,
      prompt: insertAsset.prompt,
      meshyTaskId: insertAsset.meshyTaskId || null,
      status: insertAsset.status || "pending",
      modelUrl: insertAsset.modelUrl || null,
      thumbnailUrl: insertAsset.thumbnailUrl || null,
      localPath: insertAsset.localPath || null,
      createdAt: new Date(),
    };
    this.gameAssets.push(asset);
    return asset;
  }

  async updateGameAsset(id: number, updates: Partial<InsertGameAsset>): Promise<GameAsset | undefined> {
    const index = this.gameAssets.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    
    this.gameAssets[index] = { ...this.gameAssets[index], ...updates };
    return this.gameAssets[index];
  }
}

export class DatabaseStorage implements IStorage {
  async getScores(): Promise<Score[]> {
    if (!db) throw new Error("Database not available");
    return await db.select().from(scores).orderBy(desc(scores.score)).limit(10);
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    if (!db) throw new Error("Database not available");
    const [score] = await db
      .insert(scores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getGameAssets(): Promise<GameAsset[]> {
    if (!db) throw new Error("Database not available");
    return await db.select().from(gameAssets).orderBy(desc(gameAssets.createdAt));
  }

  async getGameAssetByName(name: string): Promise<GameAsset | undefined> {
    if (!db) throw new Error("Database not available");
    const [asset] = await db.select().from(gameAssets).where(eq(gameAssets.name, name));
    return asset;
  }

  async getGameAssetsByCategory(category: string): Promise<GameAsset[]> {
    if (!db) throw new Error("Database not available");
    return await db.select().from(gameAssets).where(eq(gameAssets.category, category));
  }

  async createGameAsset(insertAsset: InsertGameAsset): Promise<GameAsset> {
    if (!db) throw new Error("Database not available");
    const [asset] = await db
      .insert(gameAssets)
      .values(insertAsset)
      .returning();
    return asset;
  }

  async updateGameAsset(id: number, updates: Partial<InsertGameAsset>): Promise<GameAsset | undefined> {
    if (!db) throw new Error("Database not available");
    const [asset] = await db
      .update(gameAssets)
      .set(updates)
      .where(eq(gameAssets.id, id))
      .returning();
    return asset;
  }
}

// Use database storage if available, otherwise fall back to memory storage
export const storage: IStorage = db ? new DatabaseStorage() : new MemoryStorage();
