/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Security Event Types
 */
export interface SecurityEvent {
  id: string;
  type: "rfid" | "dos";
  status: "authorized" | "unauthorized" | "blocked" | "detected";
  timestamp: string; // ISO date string for JSON compatibility
  location?: string;
  cardId?: string;
  ipAddress?: string;
  severity: "low" | "medium" | "high" | "critical";
  description?: string;
}

/**
 * Security Statistics
 */
export interface SecurityStats {
  totalScans: number;
  authorizedScans: number;
  unauthorizedScans: number;
  dosAttacks: number;
  activeThreats: number;
  systemStatus: "operational" | "warning" | "critical";
}

/**
 * System Health Metrics
 */
export interface SystemHealth {
  rfidReaders: {
    online: number;
    total: number;
    percentage: number;
  };
  dosProtection: {
    status: "active" | "inactive" | "maintenance";
    percentage: number;
  };
  database: {
    status: "operational" | "degraded" | "down";
    percentage: number;
  };
  network: {
    status: "normal" | "moderate" | "high" | "critical";
    percentage: number;
  };
}

/**
 * API Response Types
 */
export interface SecurityEventsResponse {
  events: SecurityEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface SecurityStatsResponse extends SecurityStats {}

export interface SystemHealthResponse extends SystemHealth {}

/**
 * Admin Authentication
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  message?: string;
}
