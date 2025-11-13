import { Request, Response } from "express";

export default function handler(req: Request, res: Response) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: process.env.DATABASE_URL ? "configured" : "not configured",
    aiProvider: process.env.OPENAI_API_KEY 
      ? "openai" 
      : process.env.BUILT_IN_FORGE_API_KEY 
      ? "manus" 
      : "not configured"
  });
}

