import {
  SecurityEventsResponse,
  SecurityStatsResponse,
  SystemHealthResponse,
  LoginRequest,
  LoginResponse,
  SecurityEvent,
} from "@shared/api";

const BASE_URL = "/api";

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Security Events
  async getSecurityEvents(
    page = 1,
    limit = 20,
  ): Promise<SecurityEventsResponse> {
    return this.request<SecurityEventsResponse>(
      `/security/events?page=${page}&limit=${limit}`,
    );
  }

  async addSecurityEvent(
    event: Partial<SecurityEvent>,
  ): Promise<SecurityEvent> {
    return this.request<SecurityEvent>("/security/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
  }

  // Security Stats
  async getSecurityStats(): Promise<SecurityStatsResponse> {
    return this.request<SecurityStatsResponse>("/security/stats");
  }

  async updateSecurityStats(
    stats: Partial<SecurityStatsResponse>,
  ): Promise<SecurityStatsResponse> {
    return this.request<SecurityStatsResponse>("/security/stats", {
      method: "PUT",
      body: JSON.stringify(stats),
    });
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealthResponse> {
    return this.request<SystemHealthResponse>("/security/health");
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async verifyToken(): Promise<{ valid: boolean; user?: any }> {
    return this.request<{ valid: boolean; user?: any }>("/auth/verify");
  }

  async logout(): Promise<{ message: string }> {
    const result = await this.request<{ message: string }>("/auth/logout", {
      method: "POST",
    });

    // Clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");

    return result;
  }

  // Helper methods for token management
  setAuthToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  clearAuthToken(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  }
}

export const apiService = new ApiService();
export default apiService;
