import { Hono } from "hono";
import { db } from "../db/index.js";
import { events, apiKeys } from "../db/schema.js";
import { createEventSchema } from "@console-ai/domain";
import { eq, and } from "drizzle-orm";
import { apiKeyMiddleware, createApiRateLimit } from "../middleware/index.js";
import { AppContext } from "../types.js";
import { ZodError } from "zod";
import { Ai } from "@console-ai/ai";

const app = new Hono<AppContext>();

// Apply API rate limiting to error endpoints
app.use("/", createApiRateLimit());

// Initialize AI instance
// Using OpenRouter
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
console.log("Initializing AI instance with OpenRouter..." , { openRouterApiKey: openRouterApiKey });

const ai = new Ai(
  {
    model: process.env.OLLAMA_MODEL || "llama3.2",
    temperature: 0.4,
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  },
  false, // Use OpenRouter
  openRouterApiKey,
);

console.log("AI instance initialized with OpenRouter");
// POST /errors - Create and process error with AI (requires API key)
app.post("/", apiKeyMiddleware, async (c) => {
  try {
    const apiKey = c.get("apiKey");
    const body = await c.req.json();
    const validated = createEventSchema.parse(body);

    // Verify API key and get project
    const apiKeyRecord = await db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.key, apiKey), eq(apiKeys.isActive, "true")),
      with: {
        project: true,
      },
    });

    if (!apiKeyRecord) {
      return c.json({ error: "Invalid API key" }, 401);
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKeyRecord.id));

    // Process error with AI
    let aiAnalysis: string;
    try {
      aiAnalysis = await ai.generateExplanation(validated);
    } catch (aiError) {
      console.error("AI processing error:", aiError);
      aiAnalysis = `Error analysis failed: ${aiError instanceof Error ? aiError.message : "Unknown error"}`;
    }

    // Store event with AI analysis in database
    const [event] = await db
      .insert(events)
      .values({
        projectId: apiKeyRecord.projectId,
        message: validated.message,
        stack: validated.stack,
        source: validated.source,
        language: validated.language,
        framework: validated.framework,
        functionName: validated.functionName,
        functionContext: validated.functionContext,
        aiAnalysis,
        metadata: validated.metadata,
      })
      .returning();

    return c.json(
      {
        event: {
          id: event.id,
          message: event.message,
          stack: event.stack,
          source: event.source,
          language: event.language,
          framework: event.framework,
          functionName: event.functionName,
          functionContext: event.functionContext,
          aiAnalysis: event.aiAnalysis,
          metadata: event.metadata,
          createdAt: event.createdAt,
        },
      },
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Validation failed", details: error.errors }, 400);
    }
    console.error("Error processing error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;

// Made with Bob
