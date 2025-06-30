import { env } from "@/env";

export interface ComposioConnection {
  id: string;
  integrationId: string;
  entityId: string;
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  metadata?: Record<string, any>;
}

export interface ComposioEntity {
  id: string;
  name: string;
  metadata?: Record<string, any>;
}

export interface GmailSendEmailParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
  cc?: string;
  bcc?: string;
}

export class ComposioService {
  private apiKey: string;
  private baseUrl = "https://backend.composio.dev/api/v1";

  constructor() {
    this.apiKey = env.COMPOSIO_API_KEY;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Composio API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Entity Management
  async createEntity(name: string): Promise<ComposioEntity> {
    return this.makeRequest("/entities", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async getEntity(entityId: string): Promise<ComposioEntity> {
    return this.makeRequest(`/entities/${entityId}`);
  }

  // Connection Management
  async initiateConnection(entityId: string, integrationId: string = "gmail") {
    return this.makeRequest("/connections/initiate", {
      method: "POST",
      body: JSON.stringify({
        entityId,
        integrationId,
        redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/integrations/callback`,
      }),
    });
  }

  async getConnection(connectionId: string): Promise<ComposioConnection> {
    return this.makeRequest(`/connections/${connectionId}`);
  }

  async getEntityConnections(entityId: string): Promise<ComposioConnection[]> {
    const response = await this.makeRequest(
      `/entities/${entityId}/connections`,
    );
    return response.connections || [];
  }

  async deleteConnection(connectionId: string): Promise<void> {
    await this.makeRequest(`/connections/${connectionId}`, {
      method: "DELETE",
    });
  }

  // Gmail Actions
  async sendEmail(connectionId: string, params: GmailSendEmailParams) {
    return this.makeRequest("/actions/execute", {
      method: "POST",
      body: JSON.stringify({
        connectionId,
        actionName: "gmail_send_email",
        input: {
          to: params.to,
          subject: params.subject,
          body: params.body,
          from: params.from,
          cc: params.cc,
          bcc: params.bcc,
        },
      }),
    });
  }

  async getEmailTemplates(connectionId: string) {
    return this.makeRequest("/actions/execute", {
      method: "POST",
      body: JSON.stringify({
        connectionId,
        actionName: "gmail_get_templates",
        input: {},
      }),
    });
  }

  // Integration Status
  async checkConnectionStatus(connectionId: string): Promise<boolean> {
    try {
      const connection = await this.getConnection(connectionId);
      return connection.status === "ACTIVE";
    } catch (error) {
      console.error("Error checking connection status:", error);
      return false;
    }
  }

  // Test Connection
  async testGmailConnection(connectionId: string): Promise<boolean> {
    try {
      await this.makeRequest("/actions/execute", {
        method: "POST",
        body: JSON.stringify({
          connectionId,
          actionName: "gmail_get_profile",
          input: {},
        }),
      });
      return true;
    } catch (error) {
      console.error("Gmail connection test failed:", error);
      return false;
    }
  }
}

export const composioService = new ComposioService();
