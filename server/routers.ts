import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Vapi Agent Management
  agents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getVapiAgentsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          firstMessage: z.string().optional(),
          systemPrompt: z.string().optional(),
          voiceProvider: z.string().optional(),
          voiceId: z.string().optional(),
          model: z.string().default("gpt-4"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const agent = await db.createVapiAgent({
          userId: ctx.user.id,
          ...input,
        });
        return agent;
      }),

    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const agent = await db.getVapiAgentById(input.id);
      if (!agent || agent.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }
      return agent;
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          firstMessage: z.string().optional(),
          systemPrompt: z.string().optional(),
          voiceProvider: z.string().optional(),
          voiceId: z.string().optional(),
          model: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const agent = await db.getVapiAgentById(id);
        if (!agent || agent.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
        await db.updateVapiAgent(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const agent = await db.getVapiAgentById(input.id);
      if (!agent || agent.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }
      await db.deleteVapiAgent(input.id);
      return { success: true };
    }),
  }),

  // Call History
  calls: router({
    listByAgent: protectedProcedure.input(z.object({ agentId: z.number() })).query(async ({ ctx, input }) => {
      const agent = await db.getVapiAgentById(input.agentId);
      if (!agent || agent.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
      }
      return db.getCallSessionsByAgentId(input.agentId);
    }),

    getMessages: protectedProcedure.input(z.object({ callSessionId: z.number() })).query(async ({ input }) => {
      return db.getConversationMessagesByCallSessionId(input.callSessionId);
    }),
  }),

  // Webhook handler (public endpoint for Vapi)
  webhook: router({
    vapi: publicProcedure
      .input(
        z.object({
          message: z.any(),
        })
      )
      .mutation(async ({ input }) => {
        const { message } = input;

        // Log the webhook event
        await db.logWebhookEvent({
          eventType: message.type || "unknown",
          payload: JSON.stringify(message),
          callSessionId: null,
        });

        // Handle different message types
        switch (message.type) {
          case "assistant.started": {
            // Call started - create session
            const callId = message.call?.id;
            if (callId) {
              // Find agent by vapiAssistantId if available
              // For now, we'll create a basic session
              await db.createCallSession({
                agentId: 1, // TODO: Map from Vapi assistant ID
                vapiCallId: callId,
                phoneNumber: message.call?.customer?.number || null,
                startedAt: new Date(),
                status: "active",
              });
            }
            break;
          }

          case "conversation-update": {
            // Message exchanged
            const callId = message.call?.id;
            if (callId) {
              const session = await db.getCallSessionByVapiCallId(callId);
              if (session) {
                // Add message to conversation
                const lastMessage = message.conversation?.[message.conversation.length - 1];
                if (lastMessage) {
                  await db.addConversationMessage({
                    callSessionId: session.id,
                    role: lastMessage.role,
                    content: lastMessage.content || "",
                    timestamp: new Date(lastMessage.timestamp || Date.now()),
                  });
                }
              }
            }
            break;
          }

          case "assistant-request": {
            // Vapi is requesting a response from us
            const callId = message.call?.id;
            const conversation = message.conversation || [];

            // Get the agent configuration
            const session = callId ? await db.getCallSessionByVapiCallId(callId) : null;
            const agent = session ? await db.getVapiAgentById(session.agentId) : null;

            // Build messages for LLM
            const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

            if (agent?.systemPrompt) {
              messages.push({
                role: "system",
                content: agent.systemPrompt,
              });
            } else {
              messages.push({
                role: "system",
                content: "You are a helpful AI assistant conducting a phone conversation. Be concise and natural.",
              });
            }

            // Add conversation history
            for (const msg of conversation) {
              if (msg.role === "user" || msg.role === "assistant") {
                messages.push({
                  role: msg.role,
                  content: msg.content || "",
                });
              }
            }

            // Get response from Manus LLM
            const llmResponse = await invokeLLM({
              messages,
            });

            const responseText = llmResponse.choices[0]?.message?.content || "I'm sorry, I didn't understand that.";

            // Return response to Vapi
            return {
              messageResponse: {
                message: responseText,
              },
            };
          }

          case "end-of-call-report": {
            // Call ended
            const callId = message.call?.id;
            if (callId) {
              const session = await db.getCallSessionByVapiCallId(callId);
              if (session) {
                await db.updateCallSession(session.id, {
                  endedAt: new Date(message.endedAt || Date.now()),
                  duration: message.call?.duration || 0,
                  status: "completed",
                  endReason: message.endedReason || "unknown",
                });
              }
            }
            break;
          }
        }

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
