import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Vapi agents configured by users
 */
export const vapiAgents = mysqlTable("vapi_agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  vapiAssistantId: varchar("vapiAssistantId", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  firstMessage: text("firstMessage"),
  systemPrompt: text("systemPrompt"),
  voiceProvider: varchar("voiceProvider", { length: 64 }),
  voiceId: varchar("voiceId", { length: 255 }),
  model: varchar("model", { length: 64 }).default("gpt-4").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VapiAgent = typeof vapiAgents.$inferSelect;
export type InsertVapiAgent = typeof vapiAgents.$inferInsert;

/**
 * Call sessions from Vapi
 */
export const callSessions = mysqlTable("call_sessions", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  vapiCallId: varchar("vapiCallId", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phoneNumber", { length: 32 }),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt"),
  duration: int("duration"),
  status: varchar("status", { length: 32 }).notNull(),
  endReason: varchar("endReason", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CallSession = typeof callSessions.$inferSelect;
export type InsertCallSession = typeof callSessions.$inferInsert;

/**
 * Conversation messages within call sessions
 */
export const conversationMessages = mysqlTable("conversation_messages", {
  id: int("id").autoincrement().primaryKey(),
  callSessionId: int("callSessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type InsertConversationMessage = typeof conversationMessages.$inferInsert;

/**
 * Webhook events from Vapi for debugging and monitoring
 */
export const webhookEvents = mysqlTable("webhook_events", {
  id: int("id").autoincrement().primaryKey(),
  callSessionId: int("callSessionId"),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  payload: text("payload").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
