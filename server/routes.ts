import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

const MESHY_API_BASE = "https://api.meshy.ai";

// Predefined game assets to generate
const GAME_ASSET_DEFINITIONS = [
  {
    name: "demogorgon_minion",
    category: "enemy",
    prompt: "Demogorgon creature from Stranger Things, flower-petal head, humanoid monster, dark flesh, horror style, game ready, low poly optimized",
    artStyle: "realistic"
  },
  {
    name: "dead_tree",
    category: "environment", 
    prompt: "Dead twisted tree, bare branches, dark bark, horror style, Upside Down aesthetic, game prop",
    artStyle: "realistic"
  },
  {
    name: "vine_tendril",
    category: "environment",
    prompt: "Organic vine tendril, dark purple, slimy texture, alien plant, Stranger Things Upside Down style",
    artStyle: "realistic"
  },
  {
    name: "ruined_wall",
    category: "environment",
    prompt: "Ruined brick wall section, crumbling, covered in vines, horror game environment prop",
    artStyle: "realistic"
  },
  {
    name: "grandfather_clock",
    category: "environment",
    prompt: "Antique grandfather clock, dark wood, ornate design, Vecna style, horror aesthetic, game prop",
    artStyle: "realistic"
  },
  {
    name: "floating_debris",
    category: "environment",
    prompt: "Broken furniture pieces floating in air, supernatural, horror game prop, chairs and tables",
    artStyle: "realistic"
  }
];

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

  // Get all game assets
  app.get("/api/game-assets", async (req, res) => {
    try {
      const assets = await storage.getGameAssets();
      res.json(assets);
    } catch (err) {
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      throw err;
    }
  });

  // Get assets by category
  app.get("/api/game-assets/category/:category", async (req, res) => {
    try {
      const assets = await storage.getGameAssetsByCategory(req.params.category);
      res.json(assets);
    } catch (err) {
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      throw err;
    }
  });

  // Initialize all game assets (creates entries and starts generation)
  app.post("/api/game-assets/initialize", async (req, res) => {
    try {
      const results = [];
      
      for (const def of GAME_ASSET_DEFINITIONS) {
        // Check if asset already exists
        let asset = await storage.getGameAssetByName(def.name);
        
        if (!asset) {
          // Create new asset entry
          asset = await storage.createGameAsset({
            name: def.name,
            category: def.category,
            prompt: def.prompt,
            status: "pending"
          });
        }
        
        results.push(asset);
      }
      
      res.json({ message: "Assets initialized", assets: results });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      throw err;
    }
  });

  // Generate a specific asset
  app.post("/api/game-assets/:name/generate", async (req, res) => {
    try {
      const { name } = req.params;
      let asset = await storage.getGameAssetByName(name);
      
      if (!asset) {
        // Find definition and create asset
        const def = GAME_ASSET_DEFINITIONS.find(d => d.name === name);
        if (!def) {
          return res.status(404).json({ message: "Asset definition not found" });
        }
        
        asset = await storage.createGameAsset({
          name: def.name,
          category: def.category,
          prompt: def.prompt,
          status: "pending"
        });
      }
      
      if (asset.status === "completed") {
        return res.json({ message: "Asset already generated", asset });
      }
      
      // Find the definition for art style
      const def = GAME_ASSET_DEFINITIONS.find(d => d.name === name);
      
      // Start generation with Meshy
      const result = await meshyRequest("/openapi/v2/text-to-3d", {
        method: "POST",
        body: JSON.stringify({
          mode: "preview",
          prompt: asset.prompt,
          negative_prompt: "low quality, low resolution, ugly, blurry",
          art_style: def?.artStyle || "realistic",
          should_remesh: true,
        }),
      });
      
      // Update asset with task ID
      await storage.updateGameAsset(asset.id, {
        meshyTaskId: result.result,
        status: "generating"
      });
      
      res.json({ message: "Generation started", taskId: result.result, asset });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      throw err;
    }
  });

  // Check and update asset status
  app.get("/api/game-assets/:name/status", async (req, res) => {
    try {
      const { name } = req.params;
      const asset = await storage.getGameAssetByName(name);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      if (!asset.meshyTaskId || asset.status === "completed") {
        return res.json(asset);
      }
      
      // Check Meshy status
      const result = await meshyRequest(`/openapi/v2/text-to-3d/${asset.meshyTaskId}`, {
        method: "GET",
      });
      
      if (result.status === "SUCCEEDED") {
        // Download and save the model
        const modelUrl = result.model_urls?.glb;
        let localPath = null;
        
        if (modelUrl) {
          try {
            const modelDir = path.join(process.cwd(), "public", "models");
            if (!fs.existsSync(modelDir)) {
              fs.mkdirSync(modelDir, { recursive: true });
            }
            
            const modelFileName = `${name}.glb`;
            localPath = `/models/${modelFileName}`;
            const fullPath = path.join(modelDir, modelFileName);
            
            // Download the file
            const modelResponse = await fetch(modelUrl);
            const arrayBuffer = await modelResponse.arrayBuffer();
            fs.writeFileSync(fullPath, Buffer.from(arrayBuffer));
            
            console.log(`Downloaded model to ${fullPath}`);
          } catch (downloadErr) {
            console.error("Failed to download model:", downloadErr);
          }
        }
        
        // Update asset as completed
        const updated = await storage.updateGameAsset(asset.id, {
          status: "completed",
          modelUrl: result.model_urls?.glb,
          thumbnailUrl: result.thumbnail_url,
          localPath
        });
        
        return res.json(updated);
      } else if (result.status === "FAILED") {
        await storage.updateGameAsset(asset.id, { status: "failed" });
        return res.json({ ...asset, status: "failed" });
      }
      
      // Still in progress
      res.json({
        ...asset,
        progress: result.progress || 0
      });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
      }
      throw err;
    }
  });

  // Generate all pending assets
  app.post("/api/game-assets/generate-all", async (req, res) => {
    try {
      const results = [];
      
      for (const def of GAME_ASSET_DEFINITIONS) {
        let asset = await storage.getGameAssetByName(def.name);
        
        if (!asset) {
          asset = await storage.createGameAsset({
            name: def.name,
            category: def.category,
            prompt: def.prompt,
            status: "pending"
          });
        }
        
        if (asset.status !== "completed" && asset.status !== "generating") {
          try {
            const result = await meshyRequest("/openapi/v2/text-to-3d", {
              method: "POST",
              body: JSON.stringify({
                mode: "preview",
                prompt: def.prompt,
                negative_prompt: "low quality, low resolution, ugly, blurry",
                art_style: def.artStyle,
                should_remesh: true,
              }),
            });
            
            await storage.updateGameAsset(asset.id, {
              meshyTaskId: result.result,
              status: "generating"
            });
            
            results.push({ name: def.name, status: "started", taskId: result.result });
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (genErr) {
            results.push({ name: def.name, status: "error", error: (genErr as Error).message });
          }
        } else {
          results.push({ name: def.name, status: asset.status });
        }
      }
      
      res.json({ message: "Generation batch started", results });
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
