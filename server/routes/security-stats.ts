import { RequestHandler } from "express";
import { SecurityStatsResponse, SystemHealthResponse } from "@shared/api";

// In-memory stats - replace with real database queries
let stats = {
  totalScans: 1247,
  authorizedScans: 1156,
  unauthorizedScans: 91,
  dosAttacks: 23,
  activeThreats: 2,
  systemStatus: "operational" as const,
};

let systemHealth = {
  rfidReaders: {
    online: 49,
    total: 50,
    percentage: 98,
  },
  dosProtection: {
    status: "active" as const,
    percentage: 100,
  },
  database: {
    status: "operational" as const,
    percentage: 95,
  },
  network: {
    status: "moderate" as const,
    percentage: 75,
  },
};

// Simulate stats updates
setInterval(() => {
  // Update stats occasionally
  if (Math.random() > 0.7) {
    stats.totalScans += Math.floor(Math.random() * 3) + 1;
    if (Math.random() > 0.8) {
      stats.unauthorizedScans += 1;
    } else {
      stats.authorizedScans += 1;
    }

    if (Math.random() > 0.9) {
      stats.dosAttacks += 1;
    }
  }

  // Simulate system health fluctuations
  systemHealth.rfidReaders.percentage = Math.max(
    95,
    Math.min(
      100,
      systemHealth.rfidReaders.percentage + (Math.random() - 0.5) * 2,
    ),
  );

  systemHealth.network.percentage = Math.max(
    60,
    Math.min(95, systemHealth.network.percentage + (Math.random() - 0.5) * 5),
  );

  systemHealth.database.percentage = Math.max(
    90,
    Math.min(100, systemHealth.database.percentage + (Math.random() - 0.5) * 2),
  );
}, 10000);

export const getSecurityStats: RequestHandler = (req, res) => {
  const response: SecurityStatsResponse = { ...stats };
  res.json(response);
};

export const getSystemHealth: RequestHandler = (req, res) => {
  const response: SystemHealthResponse = { ...systemHealth };
  res.json(response);
};

export const updateSecurityStats: RequestHandler = (req, res) => {
  const updates = req.body;

  // Validate and update stats
  Object.keys(updates).forEach((key) => {
    if (key in stats && typeof updates[key] === "number") {
      (stats as any)[key] = updates[key];
    }
  });

  res.json(stats);
};
