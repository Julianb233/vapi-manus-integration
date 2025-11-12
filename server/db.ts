import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  vapiAgents,
  InsertVapiAgent,
  VapiAgent,
  callSessions,
  InsertCallSession,
  CallSession,
  conversationMessages,
  InsertConversationMessage,
  webhookEvents,
  InsertWebhookEvent,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Vapi Agent helpers
export async function createVapiAgent(agent: InsertVapiAgent): Promise<VapiAgent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vapiAgents).values(agent);
  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(vapiAgents).where(eq(vapiAgents.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getVapiAgentsByUserId(userId: number): Promise<VapiAgent[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(vapiAgents).where(eq(vapiAgents.userId, userId)).orderBy(desc(vapiAgents.createdAt));
}

export async function getVapiAgentById(id: number): Promise<VapiAgent | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(vapiAgents).where(eq(vapiAgents.id, id)).limit(1);
  return result[0];
}

export async function updateVapiAgent(id: number, updates: Partial<InsertVapiAgent>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(vapiAgents).set(updates).where(eq(vapiAgents.id, id));
}

export async function deleteVapiAgent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(vapiAgents).where(eq(vapiAgents.id, id));
}

// Call Session helpers
export async function createCallSession(session: InsertCallSession): Promise<CallSession> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(callSessions).values(session);
  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(callSessions).where(eq(callSessions.id, insertedId)).limit(1);
  return inserted[0];
}

export async function getCallSessionByVapiCallId(vapiCallId: string): Promise<CallSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(callSessions).where(eq(callSessions.vapiCallId, vapiCallId)).limit(1);
  return result[0];
}

export async function updateCallSession(id: number, updates: Partial<InsertCallSession>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(callSessions).set(updates).where(eq(callSessions.id, id));
}

export async function getCallSessionsByAgentId(agentId: number): Promise<CallSession[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(callSessions).where(eq(callSessions.agentId, agentId)).orderBy(desc(callSessions.startedAt));
}

// Conversation Message helpers
export async function addConversationMessage(message: InsertConversationMessage): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(conversationMessages).values(message);
}

export async function getConversationMessagesByCallSessionId(callSessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(conversationMessages).where(eq(conversationMessages.callSessionId, callSessionId)).orderBy(conversationMessages.timestamp);
}

// Webhook Event helpers
export async function logWebhookEvent(event: InsertWebhookEvent): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(webhookEvents).values(event);
}
