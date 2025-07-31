import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ApifyService } from "./services/apify";
import { 
  apiKeySchema, 
  executeActorSchema,
  type ApifyActor 
} from "@shared/schema";
import { z } from "zod";

// In-memory session storage for API keys
const userSessions = new Map<string, { apiKey: string; userId: string }>();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Validate API Key and fetch actors
  app.post("/api/auth/validate", async (req, res) => {
    try {
      const { apiKey } = apiKeySchema.parse(req.body);
      
      const apifyService = new ApifyService(apiKey);
      const validation = await apifyService.validateApiKey();
      
      if (!validation.valid) {
        return res.status(401).json({ 
          message: "Invalid API key. Please check your Apify API key and try again." 
        });
      }

      // Create or get user session
      const sessionId = `session_${Date.now()}_${Math.random()}`;
      let user = await storage.getUserByUsername(validation.user.username);
      
      if (!user) {
        user = await storage.createUser({
          username: validation.user.username,
          password: "apify_user"
        });
      }

      userSessions.set(sessionId, { apiKey, userId: user.id });

      // Fetch and store user's actors
      const actors = await apifyService.getActors();
      
      // Clear existing actors for this user
      const existingActors = await storage.getActorsByUserId(user.id);
      
      // Save new actors
      const savedActors: ApifyActor[] = [];
      for (const actor of actors) {
        const saved = await storage.saveActor({
          userId: user.id,
          actorId: actor.id,
          name: actor.title,
          description: actor.description || "",
          inputSchema: null,
          lastRun: actor.stats.lastRunStartedAt ? new Date(actor.stats.lastRunStartedAt) : null,
          runCount: actor.stats.totalRuns.toString()
        });
        savedActors.push(saved);
      }

      res.json({
        success: true,
        sessionId,
        user: {
          id: user.id,
          username: user.username
        },
        actors: savedActors
      });

    } catch (error) {
      console.error("Auth validation error:", error);
      res.status(500).json({ 
        message: "Authentication failed. Please verify your API key and try again." 
      });
    }
  });

  // Get actor input schema
  app.get("/api/actors/:actorId/schema", async (req, res) => {
    try {
      const { actorId } = req.params;
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
      }

      const session = userSessions.get(sessionId)!;
      const apifyService = new ApifyService(session.apiKey);
      
      const schema = await apifyService.getActorInputSchema(actorId);
      
      res.json({ schema });

    } catch (error) {
      console.error("Schema fetch error:", error);
      res.status(500).json({ 
        message: "Failed to fetch actor schema. The actor may not exist or be accessible." 
      });
    }
  });

  // Select an actor
  app.post("/api/actors/:actorId/select", async (req, res) => {
    try {
      const { actorId } = req.params;
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
      }

      const session = userSessions.get(sessionId)!;
      await storage.updateActorSelection(session.userId, actorId, true);
      
      res.json({ success: true });

    } catch (error) {
      console.error("Actor selection error:", error);
      res.status(500).json({ message: "Failed to select actor." });
    }
  });

  // Execute actor
  app.post("/api/actors/execute", async (req, res) => {
    try {
      const { actorId, inputs } = executeActorSchema.parse(req.body);
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
      }

      const session = userSessions.get(sessionId)!;
      const apifyService = new ApifyService(session.apiKey);
      
      // Create execution record
      const execution = await storage.createExecution({
        userId: session.userId,
        actorId,
        status: "RUNNING",
        inputs,
        runId: null
      });

      // Start actor execution
      const runInfo = await apifyService.executeActor(actorId, inputs);
      
      // Update execution with run ID
      await storage.updateExecution(execution.id, {
        runId: runInfo.id,
        status: runInfo.status
      });

      res.json({
        success: true,
        executionId: execution.id,
        runId: runInfo.id,
        status: runInfo.status
      });

    } catch (error) {
      console.error("Actor execution error:", error);
      res.status(500).json({ 
        message: "Failed to execute actor. Please check your inputs and try again." 
      });
    }
  });

  // Get execution status
  app.get("/api/executions/:executionId/status", async (req, res) => {
    try {
      const { executionId } = req.params;
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
      }

      const session = userSessions.get(sessionId)!;
      const execution = await storage.getExecutionById(executionId);
      
      if (!execution || execution.userId !== session.userId) {
        return res.status(404).json({ message: "Execution not found." });
      }

      // If execution has a run ID, get updated status from Apify
      if (execution.runId) {
        const apifyService = new ApifyService(session.apiKey);
        const runInfo = await apifyService.getRunStatus(execution.runId);
        
        // Update local execution record
        await storage.updateExecution(executionId, {
          status: runInfo.status,
          stats: runInfo.stats,
          finishedAt: runInfo.finishedAt ? new Date(runInfo.finishedAt) : null
        });

        // If completed, get results
        if (runInfo.status === 'SUCCEEDED') {
          const results = await apifyService.getRunResults(execution.runId);
          await storage.updateExecution(executionId, { results });
        }

        res.json({
          id: execution.id,
          status: runInfo.status,
          stats: runInfo.stats,
          results: runInfo.status === 'SUCCEEDED' ? await apifyService.getRunResults(execution.runId) : null,
          startedAt: execution.startedAt,
          finishedAt: runInfo.finishedAt
        });
      } else {
        res.json(execution);
      }

    } catch (error) {
      console.error("Status fetch error:", error);
      res.status(500).json({ message: "Failed to fetch execution status." });
    }
  });

  // Get user's actors
  app.get("/api/actors", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId || !userSessions.has(sessionId)) {
        return res.status(401).json({ message: "Unauthorized. Please authenticate first." });
      }

      const session = userSessions.get(sessionId)!;
      const actors = await storage.getActorsByUserId(session.userId);
      
      res.json({ actors });

    } catch (error) {
      console.error("Actors fetch error:", error);
      res.status(500).json({ message: "Failed to fetch actors." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
