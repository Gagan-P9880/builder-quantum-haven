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
import {
  Shield,
  Wifi,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown,
  MapPin,
  CreditCard,
  Users,
  Activity,
} from "lucide-react";
import Layout from "@/components/Layout";
import { SecurityEvent, SecurityStats, SystemHealth } from "@shared/api";
import apiService from "@/services/api";

export default function RfidMonitor() {
  const [rfidEvents, setRfidEvents] = useState<SecurityEvent[]>([]);
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

  // Fetch RFID-specific data
  const fetchData = async () => {
    try {
      setError(null);
      const [eventsResponse, statsResponse, healthResponse] = await Promise.all(
        [
          apiService.getSecurityEvents(1, 50), // Get more events for RFID monitoring
          apiService.getSecurityStats(),
          apiService.getSystemHealth(),
        ],
      );

      // Filter events to show only RFID events
      const rfidOnlyEvents = eventsResponse.events.filter(
        (event) => event.type === "rfid",
      );
      setRfidEvents(rfidOnlyEvents);
      setStats(statsResponse);
      setSystemHealth(healthResponse);
    } catch (err) {
      console.error("Error fetching RFID data:", err);
      setError("Failed to load RFID monitoring data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 5 seconds for real-time monitoring
  useEffect(() => {
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchData();
  };

  const getStatusIcon = (status: string) => {
    return status === "authorized" ? (
      <CheckCircle className="h-4 w-4 text-success" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-destructive" />
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "authorized" ? (
      <Badge variant="outline" className="text-success border-success">
        Authorized
      </Badge>
    ) : (
      <Badge variant="destructive">Unauthorized</Badge>
    );
  };

  const filteredEvents = rfidEvents.filter(
    (event) =>
      event.cardId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const recentEvents = filteredEvents.slice(0, 10);
  const authorizationRate = stats.totalScans > 0 
    ? ((stats.authorizedScans / stats.totalScans) * 100).toFixed(1)
    : "0";

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading RFID monitor...</p>
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
                Error Loading RFID Monitor
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
            <h1 className="text-3xl font-bold text-foreground">RFID Monitor</h1>
            <p className="text-muted-foreground">
              Real-time access control and card monitoring system
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* RFID Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalScans.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Authorized Access
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.authorizedScans.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {authorizationRate}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unauthorized Attempts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.unauthorizedScans}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 inline mr-1" />
                -5% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Readers Online</CardTitle>
              <Wifi className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth?.rfidReaders.online || 0}/
                {systemHealth?.rfidReaders.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemHealth?.rfidReaders.percentage.toFixed(0)}% operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="live">Live Feed</TabsTrigger>
                <TabsTrigger value="history">Access History</TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Live RFID Activity</span>
                    </CardTitle>
                    <CardDescription>
                      Real-time access attempts and card scanning activity
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
                                event.status === "authorized"
                                  ? "bg-success/10"
                                  : "bg-destructive/10"
                              }`}
                            >
                              {getStatusIcon(event.status)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  Card: {event.cardId}
                                </span>
                                {getStatusBadge(event.status)}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </p>
                            <p
                              className={`text-xs font-medium ${
                                event.severity === "critical"
                                  ? "text-destructive"
                                  : event.severity === "high"
                                    ? "text-warning"
                                    : "text-muted-foreground"
                              }`}
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
                    <CardTitle>Access History</CardTitle>
                    <CardDescription>
                      Complete log of RFID access events
                    </CardDescription>
                    <div className="flex items-center space-x-2 pt-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by card ID, location, or description..."
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
                          <TableHead>Card ID</TableHead>
                          <TableHead>Location</TableHead>
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
                              {event.cardId}
                            </TableCell>
                            <TableCell>{event.location}</TableCell>
                            <TableCell>{getStatusBadge(event.status)}</TableCell>
                            <TableCell>
                              <span
                                className={`text-xs font-medium ${
                                  event.severity === "critical"
                                    ? "text-destructive"
                                    : event.severity === "high"
                                      ? "text-warning"
                                      : event.severity === "medium"
                                        ? "text-info"
                                        : "text-success"
                                }`}
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
            </Tabs>
          </div>

          {/* System Status Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle>RFID System Status</CardTitle>
              <CardDescription>Current reader status and health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Reader Health</span>
                      <span
                        className={`text-sm ${
                          systemHealth.rfidReaders.percentage >= 95
                            ? "text-success"
                            : systemHealth.rfidReaders.percentage >= 80
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        {systemHealth.rfidReaders.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={systemHealth.rfidReaders.percentage}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {systemHealth.rfidReaders.online} of{" "}
                      {systemHealth.rfidReaders.total} readers online
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Network Status</span>
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
                            : "High Load"}
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
                          stats.systemStatus === "operational"
                            ? "bg-success"
                            : stats.systemStatus === "warning"
                              ? "bg-warning"
                              : "bg-destructive"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        System:{" "}
                        {stats.systemStatus === "operational"
                          ? "Operational"
                          : stats.systemStatus}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      RFID access control system is functioning normally.
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Quick Stats
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Today's Scans:
                        </span>
                        <span className="font-medium">{stats.totalScans}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Success Rate:
                        </span>
                        <span className="font-medium text-success">
                          {authorizationRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Failed Attempts:
                        </span>
                        <span className="font-medium text-destructive">
                          {stats.unauthorizedScans}
                        </span>
                      </div>
                    </div>
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
