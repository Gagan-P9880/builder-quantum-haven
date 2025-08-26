import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Globe,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  Ban,
  Eye,
  Zap,
  Server,
  Target,
  AlertCircle,
} from "lucide-react";
import Layout from "@/components/Layout";
import { SecurityEvent, SecurityStats, SystemHealth } from "@shared/api";
import apiService from "@/services/api";

export default function DosProtection() {
  const [dosEvents, setDosEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalScans: 0,
    authorizedScans: 0,
    unauthorizedScans: 0,
    dosAttacks: 0,
    activeThreats: 0,
    systemStatus: "operational",
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("live");
  const [protectionEnabled, setProtectionEnabled] = useState(true);

  // Fetch DoS-specific data
  const fetchData = async () => {
    try {
      setError(null);
      const [eventsResponse, statsResponse, healthResponse] = await Promise.all(
        [
          apiService.getSecurityEvents(1, 50), // Get more events for DoS monitoring
          apiService.getSecurityStats(),
          apiService.getSystemHealth(),
        ],
      );

      // Filter events to show only DoS events
      const dosOnlyEvents = eventsResponse.events.filter(
        (event) => event.type === "dos",
      );
      setDosEvents(dosOnlyEvents);
      setStats(statsResponse);
      setSystemHealth(healthResponse);
    } catch (err) {
      console.error("Error fetching DoS data:", err);
      setError("Failed to load DoS protection data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 3 seconds for real-time monitoring
  useEffect(() => {
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchData();
  };

  const getAttackStatusIcon = (status: string) => {
    return status === "blocked" ? (
      <Shield className="h-4 w-4 text-success" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-destructive" />
    );
  };

  const getAttackStatusBadge = (status: string) => {
    return status === "blocked" ? (
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
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-destructive";
      case "high":
        return "text-warning";
      case "medium":
        return "text-info";
      default:
        return "text-success";
    }
  };

  const filteredEvents = dosEvents.filter(
    (event) =>
      event.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const recentEvents = filteredEvents.slice(0, 10);
  const blockedAttacks = dosEvents.filter(
    (event) => event.status === "blocked",
  ).length;
  const detectedAttacks = dosEvents.filter(
    (event) => event.status === "detected",
  ).length;
  const blockingRate =
    dosEvents.length > 0
      ? ((blockedAttacks / dosEvents.length) * 100).toFixed(1)
      : "0";

  // Group attacks by IP for analysis
  const ipAttackCounts = dosEvents.reduce(
    (acc, event) => {
      if (event.ipAddress) {
        acc[event.ipAddress] = (acc[event.ipAddress] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const topAttackers = Object.entries(ipAttackCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading DoS protection...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-destructive">
                Error Loading DoS Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              DoS Protection
            </h1>
            <p className="text-muted-foreground">
              Advanced Denial of Service attack detection and mitigation
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Protection:</span>
              <Switch
                checked={protectionEnabled}
                onCheckedChange={setProtectionEnabled}
              />
              <span
                className={`text-sm ${protectionEnabled ? "text-success" : "text-muted-foreground"}`}
              >
                {protectionEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <Button onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* DoS Protection Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Attacks
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.dosAttacks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +3% from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attacks Blocked
              </CardTitle>
              <Shield className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {blockedAttacks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {blockingRate}% blocking rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Threats
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats.activeThreats}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 inline mr-1" />
                -2 from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Protection Status
              </CardTitle>
              <Server className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth?.dosProtection.percentage.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {systemHealth?.dosProtection.status === "active"
                  ? "Fully operational"
                  : systemHealth?.dosProtection.status}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="live">Live Attacks</TabsTrigger>
                <TabsTrigger value="history">Attack History</TabsTrigger>
                <TabsTrigger value="analysis">IP Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Live Attack Detection</span>
                    </CardTitle>
                    <CardDescription>
                      Real-time DoS attack detection and blocking activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recentEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-full ${
                                event.status === "blocked"
                                  ? "bg-success/10"
                                  : "bg-destructive/10"
                              }`}
                            >
                              {getAttackStatusIcon(event.status)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  DoS Attack from {event.ipAddress}
                                </span>
                                {getAttackStatusBadge(event.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </p>
                            <p
                              className={`text-xs font-medium ${getSeverityColor(event.severity)}`}
                            >
                              {event.severity.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Attack History</CardTitle>
                    <CardDescription>
                      Complete log of DoS attack detection events
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by IP address or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Source IP</TableHead>
                          <TableHead>Attack Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Severity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-mono text-sm">
                              {new Date(event.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-mono">
                              {event.ipAddress}
                            </TableCell>
                            <TableCell>
                              {event.description?.includes("flood")
                                ? "TCP Flood"
                                : event.description?.includes("syn")
                                  ? "SYN Flood"
                                  : "DoS Attack"}
                            </TableCell>
                            <TableCell>
                              {getAttackStatusBadge(event.status)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-medium ${getSeverityColor(event.severity)}`}
                              >
                                {event.severity.toUpperCase()}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Source IP Analysis</CardTitle>
                    <CardDescription>
                      Top attacking IP addresses and patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topAttackers.map(([ip, count], index) => (
                        <div
                          key={ip}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive font-mono text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-mono text-sm font-medium">
                                {ip}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Source IP Address
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-destructive">
                              {count} attacks
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {((count / dosEvents.length) * 100).toFixed(1)}%
                              of total
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* System Status Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle>DoS Protection Status</CardTitle>
              <CardDescription>
                Current protection system health and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Protection Engine
                      </span>
                      <span
                        className={`text-sm ${
                          systemHealth.dosProtection.status === "active"
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {systemHealth.dosProtection.status === "active"
                          ? "Active"
                          : systemHealth.dosProtection.status}
                      </span>
                    </div>
                    <Progress
                      value={systemHealth.dosProtection.percentage}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Network Load</span>
                      <span
                        className={`text-sm ${
                          systemHealth.network.percentage >= 90
                            ? "text-success"
                            : systemHealth.network.percentage >= 70
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        {systemHealth.network.status === "normal"
                          ? "Normal"
                          : systemHealth.network.status === "moderate"
                            ? "Moderate"
                            : "High"}
                      </span>
                    </div>
                    <Progress
                      value={systemHealth.network.percentage}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Database</span>
                      <span
                        className={`text-sm ${
                          systemHealth.database.status === "operational"
                            ? "text-success"
                            : systemHealth.database.status === "degraded"
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        {systemHealth.database.status === "operational"
                          ? "Online"
                          : systemHealth.database.status}
                      </span>
                    </div>
                    <Progress
                      value={systemHealth.database.percentage}
                      className="h-2"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className={`h-2 w-2 rounded-full animate-pulse ${
                          protectionEnabled
                            ? "bg-success"
                            : "bg-muted-foreground"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        Protection: {protectionEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {protectionEnabled
                        ? "DoS protection is actively monitoring and blocking threats."
                        : "DoS protection is currently disabled."}
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Protection Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Attacks Today:
                        </span>
                        <span className="font-medium text-destructive">
                          {stats.dosAttacks}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Block Rate:
                        </span>
                        <span className="font-medium text-success">
                          {blockingRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Active Threats:
                        </span>
                        <span className="font-medium text-warning">
                          {stats.activeThreats}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Unique IPs:
                        </span>
                        <span className="font-medium">
                          {Object.keys(ipAttackCounts).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        alert("Advanced DoS protection settings coming soon!")
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
