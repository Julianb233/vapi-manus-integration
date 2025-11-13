import "dotenv/config";
import express from "express";
import { registerOAuthRoutes } from "../server/_core/oauth";

const app = express();

// Configure body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register OAuth routes
registerOAuthRoutes(app);

export default app;

