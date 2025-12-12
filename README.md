# Driver Monitoring App (dmon-app)

A modern, real-time driver monitoring application that combines video tracking,
GPS location data, and AI-powered computer vision to analyze and improve driver
behavior. Built for mobile-first experiences with comprehensive trip analytics
and safety scoring.

## ✨ Features

- **Real-time Tracking**: Simultaneous video and GPS location monitoring during
  trips
- **AI-Powered Detection**: Computer vision analysis for detecting drowsiness,
  phone usage, yawning, and other risky behaviors using Roboflow workflows
- **WebRTC Integration**: Low-latency video streaming with Roboflow Inference
  SDK
- **Trip Analytics**: Detailed trip history with route maps, speed charts, and
  event timelines
- **Driver Scoring**: Automated safety scoring system based on detected events
  and driving patterns
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Secure Authentication**: Email/password and Google OAuth
- **Cloud Storage**: S3-compatible object storage for video clips and detection
  images

## 📋 Prerequisites

Before you begin, ensure you have:

- **Bun** (latest version): [Install Bun](https://bun.sh)
- **External Services**:
  - [Roboflow Account](https://roboflow.com) - For AI workflow processing
  - [Mapbox Access Token](https://www.mapbox.com) - For map rendering
  - [Google Cloud OAuth Credentials](https://console.cloud.google.com)
    (optional) - For social login
  - S3-compatible storage service - For video/image storage

## 🚀 Getting Started

### 1. Clone the Repository

```bash git clone <repository-url> cd dmon-app ```

### 2. Install Dependencies

```bash bun install ```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=your-random-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (Optional - get from https://console.cloud.google.com) # Add
http://localhost:3000/api/auth/callback/google as authorized redirect URI
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Mapbox (Required for maps)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# S3-compatible Storage (Required for video clips)
S3_DOMAIN=your-objectstorage.com S3_REGION=fsn1 S3_BUCKET=dmon-clips
S3_ACCESS_KEY_ID=your-access-key-id S3_SECRET_ACCESS_KEY=your-secret-access-key

# Roboflow (Required for AI processing)
ROBOFLOW_API_KEY=your-roboflow-api-key
ROBOFLOW_WORKSPACE_NAME=your-workspace-name
ROBOFLOW_WORKFLOW_ID=your-workflow-id
```

> **Tip**: Generate a secure `BETTER_AUTH_SECRET` using: `openssl rand -base64
  32`

### 4. Set Up the Database

The application uses SQLite with Drizzle ORM. Migrations run automatically on
first start, or you can run them manually:

```bash
bun run drizzle-kit migrate
```

### 5. Start Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database

### Schema Overview

The application includes the following main tables:

- **Authentication**: `user`, `session`, `account`, `verification`
- **Trip Tracking**: `trip`, `tripLocation`, `tripVideoClip`, `tripEvent`

### Database Location

- **Development**: `./sqlite.db` (project root)
- **Production**: Configured via `APP_DATA_DIR` environment variable (default:
  `/app/data/sqlite.db`)

### Migrations

```bash
# Generate new migration after schema changes
bun run drizzle-kit generate

# Apply migrations
bun run drizzle-kit migrate

# Open Drizzle Studio (database GUI)
bun run drizzle-kit studio
```

## 🐳 Deployment

### Docker Compose

For local testing with persistent storage:

```bash docker-compose up -d ```

The `docker-compose.yml` includes:
- Automatic build with Mapbox token
- Volume mount for SQLite persistence
- Health checks
- Auto-restart policy

## 🏗 Architecture

### High-Level Flow

```
Mobile Client
    ↓
    ├─→ [Next.js API Routes]
    │       ├─→ Better Auth (session management)
    │       ├─→ Drizzle ORM → SQLite (trip data, events)
    │       └─→ AWS S3 SDK → Object Storage (video clips, images)
    │
    ├─→ [WebRTC Stream]
    │       └─→ Roboflow Inference (real-time AI detection)
    │
    └─→ [Roboflow Webhook]
            └─→ POST /api/webhook/roboflow
                    └─→ Store detection events
```

### Key Workflows

1. **Trip Recording**:
   - User starts trip → Create trip record
   - GPS updates sent to `/api/trips/[tripId]/locations`
   - Video recorded in chunks → Uploaded to S3 via `/api/trips/[tripId]/clips`
   - Video sent to Roboflow for analysis via WebRTC

2. **AI Detection**:
   - Roboflow analyzes video stream in real-time
   - Detections sent to webhook → Stored as trip events
   - Events include image snapshot, offset, and classification

3. **Trip Analysis**:
   - User ends trip → Calculate score based on events
   - Display route map with event markers
   - Show speed chart and statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using Next.js, Bun, and Roboflow
