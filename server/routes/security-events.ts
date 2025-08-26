import { RequestHandler } from "express";
import { SecurityEvent, SecurityEventsResponse } from "@shared/api";

// In-memory storage for demo - replace with real database
let securityEvents: SecurityEvent[] = [];

// Generate mock events for demo
const generateMockEvent = (): SecurityEvent => {
  const types = ["rfid", "dos"] as const;
  const type = types[Math.random() > 0.7 ? 1 : 0];

  if (type === "rfid") {
    const isAuthorized = Math.random() > 0.2;
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      status: isAuthorized ? "authorized" : "unauthorized",
      timestamp: new Date().toISOString(),
      location: `Floor ${Math.floor(Math.random() * 5) + 1} - Room ${Math.floor(Math.random() * 20) + 100}`,
      cardId: `CARD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      severity: isAuthorized ? "low" : Math.random() > 0.5 ? "high" : "medium",
      description: isAuthorized
        ? "Valid access card detected"
        : "Unauthorized access attempt",
    };
  } else {
    const isBlocked = Math.random() > 0.3;
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      status: isBlocked ? "blocked" : "detected",
      timestamp: new Date().toISOString(),
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      severity: isBlocked ? "high" : "critical",
      description: isBlocked
        ? "DoS attack blocked by firewall"
        : "DoS attack detected - monitoring",
    };
  }
};

// Initialize with some events
if (securityEvents.length === 0) {
  securityEvents = Array.from({ length: 20 }, generateMockEvent);
}

// Add new events periodically (simulate real-time)
setInterval(() => {
  const newEvent = generateMockEvent();
  securityEvents.unshift(newEvent);

  // Keep only last 100 events
  if (securityEvents.length > 100) {
    securityEvents = securityEvents.slice(0, 100);
  }
}, 5000);

export const getSecurityEvents: RequestHandler = (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedEvents = securityEvents.slice(startIndex, endIndex);

  const response: SecurityEventsResponse = {
    events: paginatedEvents,
    total: securityEvents.length,
    page,
    limit,
  };

  res.json(response);
};

export const addSecurityEvent: RequestHandler = (req, res) => {
  const event: Partial<SecurityEvent> = req.body;

  if (!event.type || !event.status) {
    return res
      .status(400)
      .json({ error: "Missing required fields: type, status" });
  }

  const newEvent: SecurityEvent = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    severity: "medium",
    ...event,
  } as SecurityEvent;

  securityEvents.unshift(newEvent);

  res.status(201).json(newEvent);
};
