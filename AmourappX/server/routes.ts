import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.scores.list.path, async (req, res) => {
    const topScores = await storage.getTopScores();
    const response = topScores.map(s => ({
        ...s,
        createdAt: s.createdAt?.toISOString() ?? null
    }));
    res.json(response);
  });

  app.post(api.scores.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.scores.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub;
      
      const score = await storage.createScore(userId, input);
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

  return httpServer;
}
