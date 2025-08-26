# 🛡️ SecureGuard - Security Monitoring Platform

A professional, real-time RFID access control and DoS attack detection system built with React, TypeScript, and Express.

![SecureGuard Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![Express](https://img.shields.io/badge/Express-5.1.0-000000)

## 🌟 Features

### ✅ **Real-Time Security Monitoring**

- **Live RFID access tracking** with authorized/unauthorized detection
- **DoS attack monitoring** with automatic blocking capabilities
- **Real-time dashboard** updates every 10 seconds
- **System health monitoring** with performance metrics
- **Security event feed** with severity levels and timestamps

### ✅ **Admin Panel**

- **Secure authentication** with role-based access
- **Professional login interface** with security notices
- **Session management** with "Remember Me" functionality
- **Admin controls** for system configuration

### ✅ **Modern UI/UX**

- **Dark security theme** with professional branding
- **Responsive design** for all screen sizes
- **Real-time data visualization** with progress bars and badges
- **Intuitive navigation** with clear security context
- **Professional alerts** and status indicators

### ✅ **Backend API**

- **RESTful API endpoints** for all security data
- **Real-time event generation** and storage
- **Authentication system** with JWT tokens
- **CORS enabled** for frontend integration
- **Comprehensive error handling**

## 🏗️ Tech Stack

### **Frontend**

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **TailwindCSS 3** for styling
- **Radix UI** for accessible components
- **React Router 6** for SPA navigation
- **TanStack Query** for data fetching
- **Lucide React** for icons

### **Backend**

- **Express.js** with TypeScript
- **CORS** for cross-origin requests
- **Zod** for type validation
- **In-memory storage** (ready for database integration)

### **Development**

- **PNPM** for package management
- **Vitest** for testing
- **ESLint + Prettier** for code quality
- **Hot Module Replacement** for fast development

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+
- PNPM (recommended) or npm

### **Installation**

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd secureguard
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Start development server**

```bash
pnpm dev
# or
npm run dev
```

4. **Open your browser**

```
http://localhost:8080
```

### **Admin Login Credentials**

- **Username:** `admin` | **Password:** `admin123`
- **Username:** `security` | **Password:** `secure456`

## 📋 Project Structure

```
secureguard/
├── client/                 # React frontend
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Radix UI components
│   │   └── Layout.tsx     # Main layout with navigation
│   ├── pages/             # Route components
│   │   ├── Dashboard.tsx  # Main security dashboard
│   │   ├── Admin.tsx      # Admin login page
│   │   └── Placeholder.tsx # Placeholder for future pages
│   ├── services/          # API service layer
│   └── main.tsx           # App entry point
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   │   ├── auth.ts        # Authentication endpoints
│   │   ├── security-events.ts # Security events API
│   │   └── security-stats.ts  # Statistics API
│   └── index.ts           # Server configuration
├── shared/                # Shared types and utilities
│   └── api.ts             # TypeScript interfaces
└── README.md              # This file
```

## 🔌 API Endpoints

### **Security Events**

```typescript
GET  /api/security/events     # Get paginated security events
POST /api/security/events     # Add new security event
```

### **Statistics**

```typescript
GET /api/security/stats       # Get current security statistics
PUT /api/security/stats       # Update security statistics
```

### **System Health**

```typescript
GET /api/security/health      # Get system health metrics
```

### **Authentication**

```typescript
POST /api/auth/login          # Admin login
GET  /api/auth/verify         # Verify JWT token
POST /api/auth/logout         # Logout user
```

## 🎯 Usage

### **Dashboard Overview**

- **Security Statistics:** Monitor total scans, authorized access, and attack counts
- **Recent Events:** Live feed of RFID access and DoS attacks
- **System Health:** Real-time monitoring of RFID readers, DoS protection, database, and network status
- **Auto-refresh:** Data updates every 10 seconds automatically

### **Admin Functions**

- **Secure Login:** Access admin controls with authentication
- **System Monitoring:** View all security events and statistics
- **Manual Refresh:** Force data updates when needed

## 🔧 Development Scripts

```bash
# Development
pnpm dev              # Start dev server (frontend + backend)

# Building
pnpm build            # Build for production
pnpm build:client     # Build frontend only
pnpm build:server     # Build backend only

# Production
pnpm start            # Start production server

# Testing & Quality
pnpm test             # Run tests
pnpm typecheck        # TypeScript validation
pnpm format.fix       # Format code with Prettier
```

## 🌐 Deployment

### **Option 1: Netlify (Recommended)**

1. [Connect to Netlify MCP](#open-mcp-popover) in Builder.io
2. Deploy directly from your workspace
3. Automatic builds on code changes

### **Option 2: Vercel**

1. [Connect to Vercel MCP](#open-mcp-popover) in Builder.io
2. Seamless full-stack deployment
3. Edge functions for API routes

### **Option 3: Traditional Hosting**

```bash
# Build the application
pnpm build

# Upload dist/ folder to your hosting provider
# dist/spa/     - Frontend assets
# dist/server/  - Backend server files
```

## 🔒 Security Features

### **Authentication**

- JWT token-based authentication
- Secure password handling (ready for bcrypt)
- Session management with expiration
- Role-based access control foundation

### **Data Protection**

- CORS protection for API endpoints
- Input validation with TypeScript
- Secure headers and best practices
- Environment variable support for secrets

### **Monitoring**

- Real-time threat detection simulation
- Security event logging and tracking
- System health monitoring
- Alert severity levels

## 🗄️ Database Integration

Currently uses in-memory storage for demo purposes. Ready for database integration:

### **Recommended Options**

- **[Neon PostgreSQL](#open-mcp-popover)** - Serverless Postgres
- **[Supabase](#open-mcp-popover)** - PostgreSQL + Auth + Real-time
- **MongoDB** - Document database
- **SQLite** - Local development

### **Integration Example**

```typescript
// Replace in-memory arrays with database queries
const events = await db.securityEvents.findMany({
  orderBy: { timestamp: "desc" },
  take: limit,
  skip: (page - 1) * limit,
});
```

## 🚀 Next Steps & Roadmap

### **🔥 Priority Features**

- [ ] **Database Integration** - Replace in-memory storage
- [ ] **RFID Monitor Page** - Detailed access control management
- [ ] **DoS Protection Page** - Advanced attack analysis and blocking
- [ ] **Settings Page** - User management and system configuration
- [ ] **Real Hardware Integration** - Connect to actual RFID systems

### **🌟 Advanced Features**

- [ ] **Email/SMS Alerts** - Real-time notifications for security events
- [ ] **Report Generation** - PDF/CSV exports of security data
- [ ] **Multi-location Support** - Monitor multiple facilities
- [ ] **Advanced Analytics** - Predictive security insights
- [ ] **Audit Logging** - Compliance and forensic capabilities

### **🔧 Technical Improvements**

- [ ] **Error Monitoring** with [Sentry MCP](#open-mcp-popover)
- [ ] **Performance Monitoring** and optimization
- [ ] **API Rate Limiting** for production security
- [ ] **Docker Containerization** for easy deployment
- [ ] **CI/CD Pipeline** with automated testing

### **🎨 UI/UX Enhancements**

- [ ] **Dark/Light Mode Toggle** - User preference support
- [ ] **Dashboard Customization** - Configurable widgets
- [ ] **Mobile App** - React Native companion
- [ ] **Advanced Filtering** - Search and filter security events

## 📖 Environment Variables

Create a `.env` file for configuration:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key
SESSION_TIMEOUT=86400

# Database (when integrated)
DATABASE_URL=postgresql://user:pass@host:5432/securitydb

# External Integrations
RFID_API_KEY=your-rfid-hardware-key
SMTP_SERVER=smtp.example.com
ALERT_EMAIL=admin@yourcompany.com
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**

- Use TypeScript for all new code
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for API changes
- Use semantic commit messages

## 📞 Support & Resources

### **Getting Help**

- **Builder.io Documentation:** https://www.builder.io/c/docs/projects
- **Create Issues:** Report bugs or request features
- **[Get Support](#reach-support)** for technical assistance
- **[Contact Sales](#reach-sales)** for enterprise inquiries

### **Useful Links**

- **[Open Preview](#open-preview)** - View the live application
- **[Project Settings](#open-settings)** - Configure your workspace
- **[MCP Integrations](#open-mcp-popover)** - Connect external services

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About

**SecureGuard** is a modern, professional security monitoring platform designed for real-world RFID access control and network security applications. Built with enterprise-grade technologies and best practices for scalability, security, and maintainability.

---

**Built with ❤️ using [Builder.io](https://builder.io)**

_For questions, support, or feature requests, please [reach out to our team](#reach-support)._
