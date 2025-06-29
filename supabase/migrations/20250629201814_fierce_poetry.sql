/*
  # Create agent table and agent_webhooks junction table

  1. New Tables
    - `agent`
      - `id` (text, primary key)
      - `user_id` (text, foreign key to users)
      - `name` (text, agent name)
      - `description` (text, agent description)
      - `system_prompt` (text, system prompt for AI)
      - `type` (text, agent type: response_agent, followup_agent)
      - `metadata` (text, JSON field for additional data)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `agent_webhooks`
      - `agent_id` (text, foreign key to agent)
      - `webhook_id` (text, foreign key to webhooks)
      - Primary key: (agent_id, webhook_id)

  2. Security
    - Foreign key constraints for data integrity
    - User ownership validation through user_id
*/

CREATE TABLE IF NOT EXISTS agent (
  id text PRIMARY KEY,
  user_id text REFERENCES user(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  system_prompt text NOT NULL,
  type text NOT NULL CHECK (type IN ('response_agent', 'followup_agent')),
  metadata text,
  is_active integer DEFAULT 1,
  created_at integer NOT NULL DEFAULT (unixepoch()),
  updated_at integer NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS agent_webhooks (
  agent_id text REFERENCES agent(id) ON DELETE CASCADE,
  webhook_id text REFERENCES webhooks(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, webhook_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_user_id ON agent(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_type ON agent(type);
CREATE INDEX IF NOT EXISTS idx_agent_webhooks_agent_id ON agent_webhooks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_webhooks_webhook_id ON agent_webhooks(webhook_id);