import { 
  type User, 
  type InsertUser, 
  type ApifyActor, 
  type InsertActor,
  type ExecutionRun,
  type InsertExecution 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getActorsByUserId(userId: string): Promise<ApifyActor[]>;
  saveActor(actor: InsertActor): Promise<ApifyActor>;
  updateActorSelection(userId: string, actorId: string, selected: boolean): Promise<void>;
  
  createExecution(execution: InsertExecution): Promise<ExecutionRun>;
  updateExecution(id: string, updates: Partial<ExecutionRun>): Promise<ExecutionRun | undefined>;
  getExecutionsByUserId(userId: string): Promise<ExecutionRun[]>;
  getExecutionById(id: string): Promise<ExecutionRun | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private actors: Map<string, ApifyActor>;
  private executions: Map<string, ExecutionRun>;

  constructor() {
    this.users = new Map();
    this.actors = new Map();
    this.executions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getActorsByUserId(userId: string): Promise<ApifyActor[]> {
    return Array.from(this.actors.values()).filter(
      (actor) => actor.userId === userId
    );
  }

  async saveActor(actor: InsertActor): Promise<ApifyActor> {
    const id = randomUUID();
    const savedActor: ApifyActor = { 
      ...actor, 
      id,
      description: actor.description || null,
      inputSchema: actor.inputSchema || null,
      lastRun: null,
      runCount: "0",
      isSelected: false
    };
    this.actors.set(id, savedActor);
    return savedActor;
  }

  async updateActorSelection(userId: string, actorId: string, selected: boolean): Promise<void> {
    // First, unselect all actors for this user
    Array.from(this.actors.entries()).forEach(([id, actor]) => {
      if (actor.userId === userId) {
        this.actors.set(id, { ...actor, isSelected: false });
      }
    });
    
    // Then select the specified actor
    Array.from(this.actors.entries()).forEach(([id, actor]) => {
      if (actor.userId === userId && actor.actorId === actorId) {
        this.actors.set(id, { ...actor, isSelected: selected });
      }
    });
  }

  async createExecution(execution: InsertExecution): Promise<ExecutionRun> {
    const id = randomUUID();
    const executionRun: ExecutionRun = { 
      ...execution, 
      id,
      inputs: execution.inputs || null,
      runId: execution.runId || null,
      startedAt: new Date(),
      finishedAt: null,
      stats: null,
      results: null
    };
    this.executions.set(id, executionRun);
    return executionRun;
  }

  async updateExecution(id: string, updates: Partial<ExecutionRun>): Promise<ExecutionRun | undefined> {
    const execution = this.executions.get(id);
    if (!execution) return undefined;
    
    const updated = { ...execution, ...updates };
    this.executions.set(id, updated);
    return updated;
  }

  async getExecutionsByUserId(userId: string): Promise<ExecutionRun[]> {
    return Array.from(this.executions.values()).filter(
      (execution) => execution.userId === userId
    );
  }

  async getExecutionById(id: string): Promise<ExecutionRun | undefined> {
    return this.executions.get(id);
  }
}

export const storage = new MemStorage();
