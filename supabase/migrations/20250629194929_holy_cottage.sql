/*
  # Add webhook secret field to webhooks table

  1. Schema Changes
    - Add `webhook_secret` column to webhooks table
    - Update form_type enum to include 'tally' option

  2. Data Migration
    - Generate random secrets for existing webhooks
*/

-- Add webhook_secret column to webhooks table
ALTER TABLE webhooks ADD COLUMN webhook_secret text;

-- Update existing webhooks with random secrets (for existing data)
UPDATE webhooks SET webhook_secret = lower(hex(randomblob(16))) WHERE webhook_secret IS NULL;