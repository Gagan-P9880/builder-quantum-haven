import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Wifi,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import Layout from "@/components/Layout";
import { SecurityEvent, SecurityStats, SystemHealth } from "@shared/api";
import apiService from "@/services/api";

export default function Dashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalScans: 0,
    authorizedScans: 0,
    unauthorizedScans: 0,
    dosAttacks: 0,
    activeThreats: 0,
    systemStatus: "operational"
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setError(null);
      const [eventsResponse, statsResponse, healthResponse] = await Promise.all([
        apiService.getSecurityEvents(1, 20),
        apiService.getSecurityStats(),
        apiService.getSystemHealth()
      ]);

      setEvents(eventsResponse.events);
      setStats(statsResponse);
      setSystemHealth(healthResponse);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-destructive";
      case "high": return "text-warning";
      case "medium": return "text-info";
      default: return "text-success";
    }
  };

  const getStatusBadge = (event: SecurityEvent) => {
    if (event.type === "rfid") {
      return event.status === "authorized" ? (
        <Badge variant="outline" className="text-success border-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Authorized
        </Badge>
      ) : (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Unauthorized
        </Badge>
      );
    } else {
      return event.status === "blocked" ? (
        <Badge variant="outline" className="text-success border-success">
          <Shield className="h-3 w-3 mr-1" />
          Blocked
        </Badge>
      ) : (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Detected
        </Badge>
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
            <p className="text-muted-foreground">Real-time monitoring of RFID access and DoS protection</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total RFID Scans</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authorized Access</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.authorizedScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.authorizedScans / stats.totalScans) * 100).toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unauthorized Attempts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.unauthorizedScans}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 inline mr-1" />
                -5% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DoS Attacks Blocked</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dosAttacks}</div>
              <p className="text-xs text-muted-foreground">
                Last attack: 2 hours ago
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Security Events</span>
              </CardTitle>
              <CardDescription>
                Live feed of RFID access attempts and DoS attack detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${event.type === "rfid" ? "bg-primary/10" : "bg-destructive/10"}`}>
                        {event.type === "rfid" ? (
                          <Wifi className={`h-4 w-4 ${event.status === "authorized" ? "text-success" : "text-destructive"}`} />
                        ) : (
                          <Shield className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {event.type === "rfid" ? "RFID Access" : "DoS Attack"}
                          </span>
                          {getStatusBadge(event)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.type === "rfid" 
                            ? `${event.location} • Card: ${event.cardId}`
                            : `Source IP: ${event.ipAddress}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {event.timestamp.toLocaleTimeString()}
                      </p>
                      <p className={`text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current security system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">RFID Readers</span>
                  <span className="text-sm text-success">98% Online</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">DoS Protection</span>
                  <span className="text-sm text-success">Active</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Database</span>
                  <span className="text-sm text-success">Operational</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Network</span>
                  <span className="text-sm text-warning">Moderate Load</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">System Status: Operational</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  All critical systems are functioning normally. 
                  {stats.activeThreats > 0 && ` ${stats.activeThreats} active threat(s) being monitored.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
