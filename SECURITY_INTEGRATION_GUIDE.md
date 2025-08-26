# Security System Integration Guide

> **Transform your SecureGuard demo into a production-ready security monitoring platform**

This guide provides detailed steps to integrate real security hardware and systems with your SecureGuard application, replacing the current simulated data with live security infrastructure.

## Table of Contents

1. [Overview](#overview)
2. [Database Persistence Setup](#database-persistence-setup)
3. [RFID Reader Integration](#rfid-reader-integration)
4. [Network Intrusion Detection Systems](#network-intrusion-detection-systems)
5. [External Security Device Integrations](#external-security-device-integrations)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Your current SecureGuard application uses simulated data for demonstration purposes. This guide will help you integrate:

- **Real RFID readers** for access control
- **Network intrusion detection** for DoS monitoring
- **Database persistence** for event storage
- **External security devices** for comprehensive monitoring

### Current Architecture vs Production

| Component         | Current (Demo)                | Production Target           |
| ----------------- | ----------------------------- | --------------------------- |
| Data Storage      | In-memory arrays              | PostgreSQL/MySQL database   |
| RFID Data         | Mock events every 5s          | Real-time RFID reader APIs  |
| DoS Detection     | Simulated attacks             | Network IDS/IPS integration |
| Event Persistence | Temporary (resets on restart) | Permanent database storage  |

---

## Database Persistence Setup

### Step 1: Choose Your Database

#### Option A: PostgreSQL (Recommended)

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE secureGuard;
CREATE USER secureAdmin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE secureGuard TO secureAdmin;
```

#### Option B: MySQL

```bash
# Install MySQL
sudo apt-get install mysql-server

# Create database
mysql -u root -p
CREATE DATABASE secureGuard;
CREATE USER 'secureAdmin'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON secureGuard.* TO 'secureAdmin'@'localhost';
```

### Step 2: Install Database Dependencies

```bash
# For PostgreSQL
npm install pg @types/pg

# For MySQL
npm install mysql2 @types/mysql2

# For ORM (optional but recommended)
npm install prisma @prisma/client
```

### Step 3: Create Database Schema

Create `database/schema.sql`:

```sql
-- Security Events Table
CREATE TABLE security_events (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('rfid', 'dos') NOT NULL,
    status ENUM('authorized', 'unauthorized', 'blocked', 'detected') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255),
    card_id VARCHAR(100),
    ip_address VARCHAR(45),
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_severity (severity)
);

-- Security Statistics Table
CREATE TABLE security_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    total_scans INT DEFAULT 0,
    authorized_scans INT DEFAULT 0,
    unauthorized_scans INT DEFAULT 0,
    dos_attacks INT DEFAULT 0,
    active_threats INT DEFAULT 0,
    system_status ENUM('operational', 'warning', 'critical') DEFAULT 'operational',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System Health Table
CREATE TABLE system_health (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_readers_online INT DEFAULT 0,
    rfid_readers_total INT DEFAULT 0,
    dos_protection_status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    dos_protection_percentage INT DEFAULT 100,
    database_status ENUM('operational', 'degraded', 'down') DEFAULT 'operational',
    database_percentage INT DEFAULT 100,
    network_status ENUM('normal', 'moderate', 'high', 'critical') DEFAULT 'normal',
    network_percentage INT DEFAULT 100,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RFID Cards/Users Table
CREATE TABLE rfid_cards (
    card_id VARCHAR(100) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    access_level ENUM('admin', 'employee', 'visitor', 'contractor') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Access Zones Table
CREATE TABLE access_zones (
    zone_id VARCHAR(50) PRIMARY KEY,
    zone_name VARCHAR(255) NOT NULL,
    description TEXT,
    required_access_level ENUM('admin', 'employee', 'visitor', 'contractor') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Step 4: Create Database Service

Create `server/services/database.ts`:

```typescript
import mysql from "mysql2/promise";
import { SecurityEvent, SecurityStats, SystemHealth } from "@shared/api";

class DatabaseService {
  private connection: mysql.Connection | null = null;

  async connect() {
    this.connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "secureAdmin",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "secureGuard",
      timezone: "+00:00",
    });
  }

  async getSecurityEvents(
    page: number = 1,
    limit: number = 20,
  ): Promise<SecurityEvent[]> {
    if (!this.connection) await this.connect();

    const offset = (page - 1) * limit;
    const [rows] = await this.connection.execute(
      "SELECT * FROM security_events ORDER BY timestamp DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );

    return (rows as any[]).map((row) => ({
      id: row.id,
      type: row.type,
      status: row.status,
      timestamp: row.timestamp.toISOString(),
      location: row.location,
      cardId: row.card_id,
      ipAddress: row.ip_address,
      severity: row.severity,
      description: row.description,
    }));
  }

  async addSecurityEvent(
    event: Partial<SecurityEvent>,
  ): Promise<SecurityEvent> {
    if (!this.connection) await this.connect();

    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    await this.connection.execute(
      `INSERT INTO security_events (id, type, status, timestamp, location, card_id, ip_address, severity, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        event.type,
        event.status,
        timestamp,
        event.location,
        event.cardId,
        event.ipAddress,
        event.severity,
        event.description,
      ],
    );

    return { id, timestamp, ...event } as SecurityEvent;
  }

  async getSecurityStats(): Promise<SecurityStats> {
    if (!this.connection) await this.connect();

    const [rows] = await this.connection.execute(
      "SELECT * FROM security_stats LIMIT 1",
    );
    if ((rows as any[]).length === 0) {
      // Initialize default stats
      return {
        totalScans: 0,
        authorizedScans: 0,
        unauthorizedScans: 0,
        dosAttacks: 0,
        activeThreats: 0,
        systemStatus: "operational",
      };
    }

    const row = (rows as any[])[0];
    return {
      totalScans: row.total_scans,
      authorizedScans: row.authorized_scans,
      unauthorizedScans: row.unauthorized_scans,
      dosAttacks: row.dos_attacks,
      activeThreats: row.active_threats,
      systemStatus: row.system_status,
    };
  }

  async updateSecurityStats(stats: Partial<SecurityStats>): Promise<void> {
    if (!this.connection) await this.connect();

    await this.connection.execute(
      `INSERT INTO security_stats (total_scans, authorized_scans, unauthorized_scans, dos_attacks, active_threats, system_status) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       total_scans = VALUES(total_scans),
       authorized_scans = VALUES(authorized_scans),
       unauthorized_scans = VALUES(unauthorized_scans),
       dos_attacks = VALUES(dos_attacks),
       active_threats = VALUES(active_threats),
       system_status = VALUES(system_status)`,
      [
        stats.totalScans,
        stats.authorizedScans,
        stats.unauthorizedScans,
        stats.dosAttacks,
        stats.activeThreats,
        stats.systemStatus,
      ],
    );
  }
}

export const dbService = new DatabaseService();
```

### Step 5: Update Environment Variables

Add to your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=secureAdmin
DB_PASSWORD=your_secure_password
DB_NAME=secureGuard

# Security Configuration
RFID_READER_API_URL=http://192.168.1.100:8080
RFID_READER_API_KEY=your_rfid_api_key
IDS_API_URL=http://192.168.1.200:9000
IDS_API_KEY=your_ids_api_key
```

---

## RFID Reader Integration

### Step 1: Common RFID Reader APIs

#### HID Global Readers

```typescript
// server/services/rfidService.ts
import axios from "axios";

class HIDRFIDService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.HID_RFID_API_URL || "http://192.168.1.100:8080";
    this.apiKey = process.env.HID_RFID_API_KEY || "";
  }

  async getReaderStatus(): Promise<any> {
    const response = await axios.get(`${this.baseURL}/api/readers/status`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    return response.data;
  }

  async getAccessEvents(since?: Date): Promise<any[]> {
    const params = since ? { since: since.toISOString() } : {};
    const response = await axios.get(`${this.baseURL}/api/events/access`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
      params,
    });
    return response.data;
  }

  async validateCard(cardId: string): Promise<boolean> {
    const response = await axios.post(
      `${this.baseURL}/api/cards/validate`,
      { cardId },
      { headers: { Authorization: `Bearer ${this.apiKey}` } },
    );
    return response.data.isValid;
  }
}
```

#### Mifare/NFC Readers

```typescript
class MifareRFIDService {
  private serialPort: string;

  constructor() {
    this.serialPort = process.env.RFID_SERIAL_PORT || "/dev/ttyUSB0";
  }

  async initializeReader(): Promise<void> {
    // Initialize serial connection to RFID reader
    // Implementation depends on your specific hardware
  }

  async listenForCards(): Promise<void> {
    // Set up continuous listening for card events
    // This would typically use serial communication
  }
}
```

### Step 2: Generic RFID Integration

Create `server/services/rfidIntegration.ts`:

```typescript
import { SecurityEvent } from "@shared/api";
import { dbService } from "./database";

class RFIDIntegration {
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastEventTime: Date = new Date();

  async startMonitoring(): Promise<void> {
    console.log("Starting RFID monitoring...");

    // Poll for new events every 2 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        await this.checkForNewEvents();
      } catch (error) {
        console.error("RFID monitoring error:", error);
      }
    }, 2000);
  }

  private async checkForNewEvents(): Promise<void> {
    // Replace with your RFID reader API call
    const events = await this.fetchRFIDEvents();

    for (const event of events) {
      await this.processRFIDEvent(event);
    }
  }

  private async fetchRFIDEvents(): Promise<any[]> {
    // Example for HTTP-based RFID reader
    try {
      const response = await fetch(
        `${process.env.RFID_READER_API_URL}/events`,
        {
          headers: {
            Authorization: `Bearer ${process.env.RFID_READER_API_KEY}`,
          },
        },
      );
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch RFID events:", error);
      return [];
    }
  }

  private async processRFIDEvent(rfidEvent: any): Promise<void> {
    // Convert RFID reader event to SecurityEvent
    const securityEvent: Partial<SecurityEvent> = {
      type: "rfid",
      status: rfidEvent.accessGranted ? "authorized" : "unauthorized",
      cardId: rfidEvent.cardId,
      location: rfidEvent.readerLocation,
      severity: rfidEvent.accessGranted ? "low" : "high",
      description: rfidEvent.accessGranted
        ? "Valid access card detected"
        : "Unauthorized access attempt",
    };

    // Store in database
    await dbService.addSecurityEvent(securityEvent);

    // Update statistics
    await this.updateRFIDStats(rfidEvent.accessGranted);
  }

  private async updateRFIDStats(wasAuthorized: boolean): Promise<void> {
    const stats = await dbService.getSecurityStats();
    stats.totalScans++;

    if (wasAuthorized) {
      stats.authorizedScans++;
    } else {
      stats.unauthorizedScans++;
    }

    await dbService.updateSecurityStats(stats);
  }

  stopMonitoring(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

export const rfidIntegration = new RFIDIntegration();
```

### Step 3: Popular RFID Reader Configurations

#### Impinj RAIN RFID Readers

```typescript
// Configuration for Impinj readers
const impinjConfig = {
  readerIP: "192.168.1.100",
  port: 5084,
  antennas: [1, 2, 3, 4], // Active antenna ports
  protocol: "LLRP", // Low Level Reader Protocol
};
```

#### HID Proximity Readers

```typescript
// Configuration for HID proximity card readers
const hidConfig = {
  readerType: "HID_Proximity",
  serialPort: "/dev/ttyUSB0",
  baudRate: 9600,
  dataFormat: "Wiegand26",
};
```

---

## Network Intrusion Detection Systems

### Step 1: Snort Integration

#### Installing Snort

```bash
# Ubuntu/Debian
sudo apt-get install snort

# Configure Snort rules
sudo nano /etc/snort/rules/local.rules
```

#### Snort Rules for DoS Detection

```bash
# Add to /etc/snort/rules/local.rules
alert tcp any any -> $HOME_NET any (msg:"Possible TCP DoS Attack"; flow:stateless; flags:S; threshold:type limit, track by_src, count 100, seconds 10; sid:1000001; rev:1;)
alert icmp any any -> $HOME_NET any (msg:"ICMP Flood Attack"; threshold:type limit, track by_src, count 50, seconds 10; sid:1000002; rev:1;)
alert tcp any any -> $HOME_NET 80 (msg:"HTTP DoS Attack"; flow:to_server,established; content:"GET"; http_method; threshold:type limit, track by_src, count 200, seconds 10; sid:1000003; rev:1;)
```

### Step 2: Snort Log Integration

Create `server/services/snortIntegration.ts`:

```typescript
import { watch } from "fs";
import { readFileSync } from "fs";
import { SecurityEvent } from "@shared/api";
import { dbService } from "./database";

class SnortIntegration {
  private logFile: string;
  private watcher: any;

  constructor() {
    this.logFile = process.env.SNORT_LOG_FILE || "/var/log/snort/alert.csv";
  }

  startMonitoring(): void {
    console.log("Starting Snort log monitoring...");

    this.watcher = watch(this.logFile, (eventType) => {
      if (eventType === "change") {
        this.processNewAlerts();
      }
    });
  }

  private async processNewAlerts(): Promise<void> {
    try {
      const logContent = readFileSync(this.logFile, "utf8");
      const lines = logContent.split("\n");
      const lastLine = lines[lines.length - 2]; // Last complete line

      if (lastLine && this.isDoSAlert(lastLine)) {
        await this.createDoSEvent(lastLine);
      }
    } catch (error) {
      console.error("Error processing Snort alerts:", error);
    }
  }

  private isDoSAlert(logLine: string): boolean {
    const dosKeywords = ["DoS", "Flood", "DDoS", "TCP DoS", "ICMP Flood"];
    return dosKeywords.some((keyword) => logLine.includes(keyword));
  }

  private async createDoSEvent(logLine: string): Promise<void> {
    const parts = logLine.split(",");
    const sourceIP = parts[6]; // Snort CSV format
    const message = parts[1];

    const securityEvent: Partial<SecurityEvent> = {
      type: "dos",
      status: "detected", // Default to detected, update based on firewall response
      ipAddress: sourceIP,
      severity: this.determineSeverity(message),
      description: `DoS attack detected: ${message}`,
    };

    await dbService.addSecurityEvent(securityEvent);
    await this.updateDoSStats();
  }

  private determineSeverity(
    message: string,
  ): "low" | "medium" | "high" | "critical" {
    if (message.includes("DDoS") || message.includes("critical"))
      return "critical";
    if (message.includes("high") || message.includes("severe")) return "high";
    if (message.includes("medium") || message.includes("moderate"))
      return "medium";
    return "low";
  }

  private async updateDoSStats(): Promise<void> {
    const stats = await dbService.getSecurityStats();
    stats.dosAttacks++;
    stats.activeThreats++;
    await dbService.updateSecurityStats(stats);
  }

  stopMonitoring(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}

export const snortIntegration = new SnortIntegration();
```

### Step 3: Suricata Integration

#### Suricata Configuration

```bash
# Install Suricata
sudo apt-get install suricata

# Configure for DoS detection
sudo nano /etc/suricata/suricata.yaml
```

#### Suricata Eve JSON Integration

```typescript
// server/services/suricataIntegration.ts
import { createReadStream } from "fs";
import { createInterface } from "readline";

class SuricataIntegration {
  private eveLogFile: string;

  constructor() {
    this.eveLogFile =
      process.env.SURICATA_EVE_LOG || "/var/log/suricata/eve.json";
  }

  async startMonitoring(): Promise<void> {
    const fileStream = createReadStream(this.eveLogFile);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on("line", async (line) => {
      try {
        const event = JSON.parse(line);
        if (event.event_type === "alert" && this.isDoSAlert(event)) {
          await this.processDoSAlert(event);
        }
      } catch (error) {
        console.error("Error parsing Suricata event:", error);
      }
    });
  }

  private isDoSAlert(event: any): boolean {
    const signature = event.alert?.signature?.toLowerCase() || "";
    return (
      signature.includes("dos") ||
      signature.includes("flood") ||
      signature.includes("ddos")
    );
  }

  private async processDoSAlert(event: any): Promise<void> {
    const securityEvent: Partial<SecurityEvent> = {
      type: "dos",
      status: "detected",
      ipAddress: event.src_ip,
      severity: this.mapSeverity(event.alert?.severity),
      description: `${event.alert?.signature} - ${event.alert?.category}`,
    };

    await dbService.addSecurityEvent(securityEvent);
  }

  private mapSeverity(
    suricataSeverity: number,
  ): "low" | "medium" | "high" | "critical" {
    if (suricataSeverity === 1) return "critical";
    if (suricataSeverity === 2) return "high";
    if (suricataSeverity === 3) return "medium";
    return "low";
  }
}
```

---

## External Security Device Integrations

### Step 1: Firewall Integration (pfSense)

```typescript
// server/services/pfSenseIntegration.ts
import axios from "axios";

class PfSenseIntegration {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.PFSENSE_API_URL || "https://192.168.1.1";
    this.apiKey = process.env.PFSENSE_API_KEY || "";
  }

  async getFirewallLogs(): Promise<any[]> {
    const response = await axios.get(
      `${this.baseURL}/api/v1/diagnostics/logs/firewall`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        params: { limit: 100 },
      },
    );
    return response.data.data;
  }

  async blockIP(ipAddress: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseURL}/api/v1/firewall/alias/entry`,
        {
          alias: "blocked_ips",
          address: ipAddress,
          description: `Auto-blocked by SecureGuard - ${new Date().toISOString()}`,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        },
      );
      return true;
    } catch (error) {
      console.error("Failed to block IP:", error);
      return false;
    }
  }

  async getBlockedIPs(): Promise<string[]> {
    const response = await axios.get(`${this.baseURL}/api/v1/firewall/alias`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
      params: { name: "blocked_ips" },
    });
    return response.data.data?.address || [];
  }
}

export const pfSenseIntegration = new PfSenseIntegration();
```

### Step 2: SIEM Integration (Splunk)

```typescript
// server/services/splunkIntegration.ts
import axios from "axios";

class SplunkIntegration {
  private baseURL: string;
  private token: string;

  constructor() {
    this.baseURL =
      process.env.SPLUNK_API_URL || "https://splunk.company.com:8089";
    this.token = process.env.SPLUNK_API_TOKEN || "";
  }

  async sendEvent(event: SecurityEvent): Promise<void> {
    const splunkEvent = {
      time: new Date(event.timestamp).getTime() / 1000,
      source: "secureGuard",
      sourcetype: "security_event",
      event: {
        type: event.type,
        status: event.status,
        severity: event.severity,
        location: event.location,
        cardId: event.cardId,
        ipAddress: event.ipAddress,
        description: event.description,
      },
    };

    await axios.post(`${this.baseURL}/services/collector/event`, splunkEvent, {
      headers: {
        Authorization: `Splunk ${this.token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async querySecurityEvents(query: string): Promise<any[]> {
    const response = await axios.post(
      `${this.baseURL}/services/search/jobs`,
      `search=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Splunk ${this.token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    // Process Splunk search results
    return response.data;
  }
}
```

### Step 3: Video Surveillance Integration (Milestone XProtect)

```typescript
// server/services/milestoneIntegration.ts
class MilestoneIntegration {
  private baseURL: string;
  private token: string;

  constructor() {
    this.baseURL = process.env.MILESTONE_API_URL || "http://192.168.1.50:80";
    this.token = process.env.MILESTONE_TOKEN || "";
  }

  async getCameraList(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}/api/rest/v1/cameras`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return await response.json();
  }

  async triggerRecording(
    cameraId: string,
    duration: number = 30,
  ): Promise<boolean> {
    try {
      await fetch(
        `${this.baseURL}/api/rest/v1/cameras/${cameraId}/recording/start`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${this.token}` },
          body: JSON.stringify({ duration }),
        },
      );
      return true;
    } catch (error) {
      console.error("Failed to trigger recording:", error);
      return false;
    }
  }

  async getSnapshot(cameraId: string): Promise<Buffer> {
    const response = await fetch(
      `${this.baseURL}/api/rest/v1/cameras/${cameraId}/snapshot`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
    return Buffer.from(await response.arrayBuffer());
  }
}
```

---

## Production Deployment

### Step 1: Update Server Integration

Modify `server/index.ts` to start all integrations:

```typescript
import { rfidIntegration } from "./services/rfidIntegration";
import { snortIntegration } from "./services/snortIntegration";
import { dbService } from "./services/database";

export function createServer() {
  const app = express();

  // ... existing middleware and routes ...

  // Start security integrations in production
  if (process.env.NODE_ENV === "production") {
    // Initialize database
    dbService.connect();

    // Start RFID monitoring
    rfidIntegration.startMonitoring();

    // Start IDS monitoring
    snortIntegration.startMonitoring();

    console.log("🔒 Security integrations started");
  }

  return app;
}
```

### Step 2: Environment Configuration

Create `production.env`:

```env
NODE_ENV=production

# Database
DB_HOST=your-database-host.com
DB_USER=secureAdmin
DB_PASSWORD=your-secure-production-password
DB_NAME=secureGuard

# RFID Reader
RFID_READER_API_URL=http://192.168.1.100:8080
RFID_READER_API_KEY=your-rfid-api-key

# Intrusion Detection
SNORT_LOG_FILE=/var/log/snort/alert.csv
SURICATA_EVE_LOG=/var/log/suricata/eve.json

# Firewall
PFSENSE_API_URL=https://192.168.1.1
PFSENSE_API_KEY=your-pfsense-api-key

# SIEM
SPLUNK_API_URL=https://splunk.company.com:8089
SPLUNK_API_TOKEN=your-splunk-token

# Video Surveillance
MILESTONE_API_URL=http://192.168.1.50:80
MILESTONE_TOKEN=your-milestone-token
```

### Step 3: Docker Production Setup

Create `docker-compose.production.yml`:

```yaml
version: "3.8"

services:
  secureguard-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    env_file:
      - production.env
    depends_on:
      - database
    volumes:
      - /var/log/snort:/var/log/snort:ro
      - /var/log/suricata:/var/log/suricata:ro
    restart: unless-stopped

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: secureGuard
      MYSQL_USER: secureAdmin
      MYSQL_PASSWORD: your-secure-production-password
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

volumes:
  db_data:
```

---

## Troubleshooting

### Common Issues

#### RFID Reader Connection

```bash
# Test RFID reader connectivity
curl -H "Authorization: Bearer YOUR_API_KEY" http://192.168.1.100:8080/api/status

# Check serial port permissions
sudo usermod -a -G dialout $USER
sudo chmod 666 /dev/ttyUSB0
```

#### Database Connection

```bash
# Test database connection
mysql -h localhost -u secureAdmin -p secureGuard

# Check database logs
sudo tail -f /var/log/mysql/error.log
```

#### Network Monitoring

```bash
# Check Snort status
sudo systemctl status snort

# Test Snort rules
sudo snort -T -c /etc/snort/snort.conf

# Monitor Suricata
sudo tail -f /var/log/suricata/eve.json
```

### Performance Optimization

#### Database Indexing

```sql
-- Add indexes for better query performance
CREATE INDEX idx_events_timestamp ON security_events(timestamp);
CREATE INDEX idx_events_type_status ON security_events(type, status);
CREATE INDEX idx_events_severity ON security_events(severity);
```

#### Connection Pooling

```typescript
// Use connection pooling for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

### Security Considerations

1. **API Key Management**: Use environment variables, never commit keys to code
2. **Network Segmentation**: Isolate security devices on dedicated VLANs
3. **Encryption**: Use TLS/SSL for all API communications
4. **Access Control**: Implement role-based access for security data
5. **Audit Logging**: Log all configuration changes and administrative actions

### Monitoring and Alerting

#### Health Checks

```typescript
// Add health check endpoints
app.get("/api/health/rfid", async (req, res) => {
  const status = await rfidIntegration.getHealthStatus();
  res.json({ status, timestamp: new Date().toISOString() });
});

app.get("/api/health/database", async (req, res) => {
  const status = await dbService.healthCheck();
  res.json({ status, timestamp: new Date().toISOString() });
});
```

#### Alerting Integration

```typescript
// Email/SMS alerts for critical events
import nodemailer from "nodemailer";

class AlertService {
  async sendCriticalAlert(event: SecurityEvent): Promise<void> {
    if (event.severity === "critical") {
      // Send immediate notification
      await this.sendEmail({
        to: process.env.SECURITY_ADMIN_EMAIL,
        subject: "CRITICAL: Security Event Detected",
        body: `Critical security event: ${event.description}`,
      });
    }
  }
}
```

---

## Next Steps

1. **Start with Database**: Set up persistent storage first
2. **Test Individual Integrations**: Implement one system at a time
3. **Monitor Performance**: Watch for bottlenecks as you add integrations
4. **Security Hardening**: Implement proper authentication and encryption
5. **Documentation**: Document your specific hardware configurations
6. **Backup Strategy**: Implement regular backups of security data
7. **Disaster Recovery**: Plan for system failures and recovery procedures

For specific vendor integrations not covered here, consult the manufacturer's API documentation and adapt the patterns shown in this guide.

---

**Need Help?**

- Check the [Troubleshooting](#troubleshooting) section
- Review vendor API documentation
- Test each integration individually before combining
- Monitor system logs for integration errors

**Security Note**: Always test integrations in a development environment before deploying to production security systems.
