import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

// Configure body parser with larger size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC middleware
const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

// Handle all tRPC requests
app.all("*", trpcMiddleware);

export default app;

