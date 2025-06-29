# Closelead MVP: Technical Product Requirements Document (PRD)

## MVP Vision

**Goal**: Build a minimal viable lead management platform that automates the journey from form submission to meeting booking.

**Core Value Proposition**: Automatically score incoming leads, send personalized follow-ups to high value leads, and book meetings - all with minimal manual intervention.

## MVP System Overview

- **Frontend**: Next.js
- **Backend**: Next.js API routes
- **Database**: LibSQL (SQLite)
- **Messaging**: Gmail
- **Authentication**: BetterAuth
- **Gmail Integration**: Composio Gmail API
- **Trpc**: For API calls
- **UI Framework**: Shadcn UI

## MVP Database Schema

**Essential Tables Only**:

```sql
-- Users table (existing)
users (id, email, name, created_at, updated_at)

-- Webhooks table - simplified
webhooks (
  id, 
  user_id, 
  name, 
  webhook_url, 
  form_type, -- 'typeform' | 'google_forms' | 'custom'
  is_active,
  created_at
)

-- Leads table - core fields only
leads (
  id,
  user_id,
  webhook_id,
  name,
  email,
  phone,
  company,
  raw_data, -- JSON field for form submission
  score, -- 1-10 AI generated score
  status, -- 'new' | 'contacted' | 'meeting_booked' | 'closed'
  created_at,
  updated_at
)

-- Messages table - track sent emails
messages (
  id,
  lead_id,
  user_id,
  subject,
  content,
  sent_at,
  status -- 'sent' | 'failed'
)
-- Agent table
agent (
  id,
  user_id,
  system_prompt,
  type,
  metadata,
  is_active,
  created_at,
  updated_at
)
```

## MVP API Endpoints

**Public Webhooks**:
- `POST /api/webhook/[webhookId]` - Receive form submissions

**Internal APIs**:
- `GET /api/leads` - List leads with pagination
- `POST /api/leads/[id]/score` - Trigger AI scoring
- `POST /api/leads/[id]/send-email` - Send follow-up email
- `PUT /api/leads/[id]` - Update lead status
- `GET /api/templates` - List email templates
- `POST /api/templates` - Create email template

## MVP User Journey

### 1. Onboarding (Simplified)
1. **Sign up** with Google OAuth
2. **Can create multiple webhooks** - Create webhook URL for forms
3. **Setup email template** - One default template to start
4. **Connect Gmail** - OAuth consent for sending emails

### 2. Core Workflow
1. **Form submission** hits webhook
2. **Lead created** with basic info extraction
3. **AI scoring** (simple prompt-based scoring 1-10)
4. **Auto-email** sent if score > 6
5. **AI Agent** is triggered to respond to the lead if the score is > 6. The agent is configured to respond to the lead with a message based on the system prompt.
6. **Dashboard update** shows new lead in a kanban board view with drag and drop feature, Table view (Both of which are present as a tab in the dashboard)

### 3. Dashboard Management
- **Lead list view** with basic filtering

## MVP Technical Decisions

**Simplified Choices for Speed**:
- Basic AI scoring (single prompt, no complex algorithms)
- Simple email templates (basic variable substitution)

**Future Enhancements** (Post-MVP):
- Calendar integration
- Multiple email sequences
- Analytics dashboard
- Team collaboration features

## MVP Success Metrics

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