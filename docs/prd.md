# Technical Product Requirements Document (PRD)

## System Overview

**Architecture Pattern**: Full-stack Next.js application with API routes handling webhooks, AI processing, and automated messaging workflows.

**Core Flow**: Webhook ingestion → AI scoring → Lead creation → Automated follow-up → Calendar sync → Dashboard updates

## Technical Stack

- **Frontend**: Next.js
- **Backend**: Next.js API routes
- **Database**: LibSQL (SQLite)
- **Messaging**: Gmail
- **Authentication**: BetterAuth
- **Gmail Integration**: Composio Gmail API
- **Trpc**: For API calls
- **UI Framework**: Shadcn UI

## Database Schema Design

**Core Tables**:
- `users` - User accounts and configuration
- `webhooks` - User webhook endpoints and metadata (form type - "tally", "typeform", signing secret, webhook url, webhook name)
- `leads` - Lead profiles with scores and status
- `messages` - Message history and templates
- `appointments` - Calendar events and status tracking
- `email_templates` - User-defined follow-up templates

**Key Relationships**: User → Webhooks (1:many), User → Leads (1:many), Leads → Messages (1:many), Leads → Appointments (1:many)

## API Architecture

**Webhook Endpoints**:
- `POST /api/webhook/[userId]` - Dynamic webhook receiver per user
- `POST /api/webhook/cal/[userId]` - Cal.com appointment updates

**Internal APIs**:
- `POST /api/leads/score` - AI scoring service
- `POST /api/messages/send` - Email dispatch
- `GET /api/dashboard/[userId]` - Dashboard data aggregation

## User Onboarding Flow (Revised)

1. **Account Creation** → Email verification → Profile setup
2. **Webhook Configuration** → Generate unique webhook URL → Integration instructions
3. **Cal.com Integration** → Link verification → Webhook setup for appointments
4. **Template Setup** → Default templates provided → Customization options
5. **AI Scoring Configuration** → Field mapping → Scoring criteria setup

## Core System Components

**Webhook Processing Engine**:
- Async queue for webhook processing
- JSON payload validation and sanitization
- Rate limiting and duplicate detection
- Error handling and retry mechanisms

**AI Scoring Module**:
- Configurable scoring algorithms per user
- Field extraction and normalization
- Prompt engineering for consistent scoring
- Fallback scoring for API failures

**Message Automation System**:
- Template engine with variable substitution
- Gmail API integration with OAuth2
- Send queue with retry logic
- Delivery status tracking

**Calendar Sync Service**:
- Cal.com webhook processing
- Appointment status mapping
- Lead status auto-updates
- Conflict resolution for duplicate events

## Dashboard Implementation

**Real-time Updates**:
- Optimistic UI updates with rollback capability

**View Components**:
- Kanban board with drag-and-drop (react-beautiful-dnd)
- Data table with sorting/filtering (TanStack Table)
- Lead detail modals with inline editing

## Security & Performance

**Security Measures**:
- Input sanitization and validation
- rate limiting on webhooks

**Performance Optimizations**:
- Database indexing on frequently queried fields
- Pagination for large lead datasets

## Deployment & Infrastructure

**Environment Configuration**:
- Production: Turso (LibSQL cloud)
- Environment variables for API keys and secrets

## Integration Points

**External APIs**:
- Composio Gmail API for email delivery
- Form platforms (Typeform, Google Forms) via webhooks

**Webhook Security**:
- Payload size limits and timeout handling
- rate limiting on webhooks