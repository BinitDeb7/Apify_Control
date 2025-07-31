import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const apifyActors = pgTable("apify_actors", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  actorId: text("actor_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  inputSchema: jsonb("input_schema"),
  lastRun: timestamp("last_run"),
  runCount: text("run_count").default("0"),
  isSelected: boolean("is_selected").default(false),
});

export const executionRuns = pgTable("execution_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  actorId: text("actor_id").notNull(),
  runId: text("run_id"),
  status: text("status").notNull(), // 'READY', 'RUNNING', 'SUCCEEDED', 'FAILED'
  inputs: jsonb("inputs"),
  results: jsonb("results"),
  startedAt: timestamp("started_at").defaultNow(),
  finishedAt: timestamp("finished_at"),
  stats: jsonb("stats"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertActorSchema = createInsertSchema(apifyActors).omit({
  id: true,
});

export const insertExecutionSchema = createInsertSchema(executionRuns).omit({
  id: true,
  startedAt: true,
});

export const apiKeySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

export const executeActorSchema = z.object({
  actorId: z.string().min(1, "Actor ID is required"),
  inputs: z.record(z.any()),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ApifyActor = typeof apifyActors.$inferSelect;
export type InsertActor = z.infer<typeof insertActorSchema>;
export type ExecutionRun = typeof executionRuns.$inferSelect;
export type InsertExecution = z.infer<typeof insertExecutionSchema>;
export type ApiKeyRequest = z.infer<typeof apiKeySchema>;
export type ExecuteActorRequest = z.infer<typeof executeActorSchema>;
