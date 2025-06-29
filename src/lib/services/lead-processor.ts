import { db } from "@/server/db";
import { leads } from "@/server/db/schema/leads";
import { agent, agentWebhooks } from "@/server/db/schema/agent";
import { webhooks } from "@/server/db/schema/webhook";
import { messages } from "@/server/db/schema/messages";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { scoreLeadWithAI, type LeadScoringResult } from "./openai";

export interface ProcessedLead {
  id: string;
  score: number;
  scoreBreakdown: LeadScoringResult;
  triggeredAgents: string[];
}

export async function processWebhookLead(
  webhookId: string,
  leadData: Record<string, any>
): Promise<ProcessedLead> {
  try {
    // Get webhook details
    const webhook = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId))
      .get();

    if (!webhook) {
      throw new Error("Webhook not found");
    }

    // Extract lead information from raw data
    const extractedLead = extractLeadInfo(leadData);

    // Score the lead using AI
    const scoringResult = await scoreLeadWithAI(leadData, webhook.scoringPrompt);

    // Create lead record
    const leadId = createId();
    const newLead = await db
      .insert(leads)
      .values({
        id: leadId,
        userId: webhook.userId,
        webhookId: webhookId,
        name: extractedLead.name,
        email: extractedLead.email,
        phone: extractedLead.phone,
        company: extractedLead.company,
        rawData: JSON.stringify(leadData),
        score: scoringResult.score,
        scoreBreakdown: JSON.stringify(scoringResult),
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();

    // Get agents triggered by this webhook
    const triggeredAgents = await getTriggeredAgents(webhookId, scoringResult.score);

    // Process agent actions based on score
    await processAgentActions(leadId, triggeredAgents, extractedLead, scoringResult);

    return {
      id: leadId,
      score: scoringResult.score,
      scoreBreakdown: scoringResult,
      triggeredAgents: triggeredAgents.map(a => a.id),
    };
  } catch (error) {
    console.error("Error processing webhook lead:", error);
    throw error;
  }
}

function extractLeadInfo(rawData: Record<string, any>) {
  // Common field mappings for different form types
  const fieldMappings = {
    name: ['name', 'full_name', 'fullName', 'first_name', 'firstName', 'contact_name'],
    email: ['email', 'email_address', 'emailAddress', 'contact_email'],
    phone: ['phone', 'phone_number', 'phoneNumber', 'contact_phone', 'mobile'],
    company: ['company', 'company_name', 'companyName', 'organization', 'business_name'],
  };

  const extracted: any = {};

  // Extract fields using mapping
  for (const [key, possibleFields] of Object.entries(fieldMappings)) {
    for (const field of possibleFields) {
      if (rawData[field]) {
        extracted[key] = rawData[field];
        break;
      }
    }
  }

  // Fallback: try to find email pattern if not found
  if (!extracted.email) {
    for (const [key, value] of Object.entries(rawData)) {
      if (typeof value === 'string' && value.includes('@')) {
        extracted.email = value;
        break;
      }
    }
  }

  // Fallback: try to find name if not found
  if (!extracted.name) {
    const nameFields = Object.keys(rawData).filter(key => 
      key.toLowerCase().includes('name') && 
      typeof rawData[key] === 'string' &&
      rawData[key].length > 0
    );
    if (nameFields.length > 0) {
      extracted.name = rawData[nameFields[0]];
    }
  }

  return {
    name: extracted.name || 'Unknown',
    email: extracted.email || '',
    phone: extracted.phone || null,
    company: extracted.company || null,
  };
}

async function getTriggeredAgents(webhookId: string, score: number) {
  // Get all agents that are triggered by this webhook and are active
  const triggeredAgents = await db
    .select({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      systemPrompt: agent.systemPrompt,
      userId: agent.userId,
    })
    .from(agent)
    .innerJoin(agentWebhooks, eq(agentWebhooks.agentId, agent.id))
    .where(
      and(
        eq(agentWebhooks.webhookId, webhookId),
        eq(agent.isActive, true)
      )
    );

  // Filter agents based on score threshold (only trigger for scores > 6)
  return triggeredAgents.filter(agent => score > 6);
}

async function processAgentActions(
  leadId: string,
  triggeredAgents: any[],
  leadInfo: any,
  scoringResult: LeadScoringResult
) {
  for (const agent of triggeredAgents) {
    try {
      // TODO: Implement email sending logic here
      // This is where you would:
      // 1. Generate personalized email content using the agent's system prompt
      // 2. Send email via your email service (Resend, etc.)
      // 3. Log the message in the messages table
      
      // For now, we'll just log the message intent
      await db
        .insert(messages)
        .values({
          id: createId(),
          leadId: leadId,
          userId: agent.userId,
          subject: `Follow-up for ${leadInfo.name} (Score: ${scoringResult.score})`,
          content: `Agent ${agent.name} would send: ${agent.systemPrompt}`,
          sentAt: new Date(),
          status: 'pending', // Would be 'sent' after actual email sending
        });

      console.log(`Agent ${agent.name} triggered for lead ${leadId} with score ${scoringResult.score}`);
      
      // TODO: Future email implementation would go here:
      // - Use agent.systemPrompt to generate personalized content
      // - Include lead information and scoring context
      // - Send via email service
      // - Update message status to 'sent' or 'failed'
      
    } catch (error) {
      console.error(`Error processing agent ${agent.id}:`, error);
    }
  }
}