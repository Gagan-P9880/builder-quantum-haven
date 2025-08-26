import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getSecurityEvents, addSecurityEvent } from "./routes/security-events";
import {
  getSecurityStats,
  getSystemHealth,
  updateSecurityStats,
} from "./routes/security-stats";
import { login, verifyToken, logout } from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Security Events API
  app.get("/api/security/events", getSecurityEvents);
  app.post("/api/security/events", addSecurityEvent);

  // Security Stats API
  app.get("/api/security/stats", getSecurityStats);
  app.put("/api/security/stats", updateSecurityStats);

  // System Health API
  app.get("/api/security/health", getSystemHealth);

  // Authentication API
  app.post("/api/auth/login", login);
  app.get("/api/auth/verify", verifyToken);
  app.post("/api/auth/logout", logout);

  return app;
}
