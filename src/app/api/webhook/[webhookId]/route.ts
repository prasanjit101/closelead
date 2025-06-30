import { NextRequest, NextResponse } from "next/server";
import { processWebhookLead } from "@/lib/services/lead-processor";
import { db } from "@/server/db";
import { webhooks } from "@/server/db/schema/webhook";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: { webhookId: string } },
) {
  try {
    const webhookId = params.webhookId;

    // Verify webhook exists and is active
    const webhook = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId))
      .get();

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    if (!webhook.isActive) {
      return NextResponse.json(
        { error: "Webhook is inactive" },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Verify webhook secret if provided
    const providedSecret = request.headers.get("x-webhook-secret");
    if (webhook.webhookSecret && providedSecret !== webhook.webhookSecret) {
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 },
      );
    }

    // Process the lead
    const result = await processWebhookLead(webhookId, body);

    return NextResponse.json({
      success: true,
      leadId: result.id,
      score: result.score,
      triggeredAgents: result.triggeredAgents.length,
      message: `Lead processed successfully with score ${result.score}/10`,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(
  request: NextRequest,
  { params }: { params: { webhookId: string } },
) {
  try {
    const webhookId = params.webhookId;

    // Verify webhook exists
    const webhook = await db
      .select({
        id: webhooks.id,
        name: webhooks.name,
        formType: webhooks.formType,
        isActive: webhooks.isActive,
      })
      .from(webhooks)
      .where(eq(webhooks.id, webhookId))
      .get();

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhook.id,
        name: webhook.name,
        formType: webhook.formType,
        isActive: webhook.isActive,
      },
      message: "Webhook is ready to receive data",
    });
  } catch (error) {
    console.error("Webhook verification error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
