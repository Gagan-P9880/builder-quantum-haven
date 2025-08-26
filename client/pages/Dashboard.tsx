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

interface SecurityEvent {
  id: string;
  type: "rfid" | "dos";
  status: "authorized" | "unauthorized" | "blocked" | "detected";
  timestamp: Date;
  location?: string;
  cardId?: string;
  ipAddress?: string;
  severity: "low" | "medium" | "high" | "critical";
}

export default function Dashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState({
    totalScans: 1247,
    authorizedScans: 1156,
    unauthorizedScans: 91,
    dosAttacks: 23,
    activeThreats: 2,
    systemStatus: "operational" as "operational" | "warning" | "critical"
  });

  // Simulate real-time events
  useEffect(() => {
    const generateMockEvent = (): SecurityEvent => {
      const types = ["rfid", "dos"] as const;
      const type = types[Math.random() > 0.7 ? 1 : 0];
      
      if (type === "rfid") {
        return {
          id: Math.random().toString(36).substr(2, 9),
          type,
          status: Math.random() > 0.2 ? "authorized" : "unauthorized",
          timestamp: new Date(),
          location: `Floor ${Math.floor(Math.random() * 5) + 1} - Room ${Math.floor(Math.random() * 20) + 100}`,
          cardId: `CARD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          severity: Math.random() > 0.8 ? "high" : Math.random() > 0.6 ? "medium" : "low"
        };
      } else {
        return {
          id: Math.random().toString(36).substr(2, 9),
          type,
          status: Math.random() > 0.3 ? "blocked" : "detected",
          timestamp: new Date(),
          ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          severity: Math.random() > 0.5 ? "critical" : "high"
        };
      }
    };

    // Add initial events
    const initialEvents = Array.from({ length: 10 }, generateMockEvent);
    setEvents(initialEvents);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newEvent = generateMockEvent();
      setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep last 20 events
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalScans: prev.totalScans + (newEvent.type === "rfid" ? 1 : 0),
        authorizedScans: prev.authorizedScans + (newEvent.type === "rfid" && newEvent.status === "authorized" ? 1 : 0),
        unauthorizedScans: prev.unauthorizedScans + (newEvent.type === "rfid" && newEvent.status === "unauthorized" ? 1 : 0),
        dosAttacks: prev.dosAttacks + (newEvent.type === "dos" ? 1 : 0)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
