"use client";

import { trpc } from "@/trpc/react";
import { AgentCard } from "./AgentCard";
import { AddAgentDialog } from "./AddAgentDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Bot, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AgentsList() {
  const { 
    data: agents, 
    isLoading, 
    error, 
    refetch 
  } = trpc.agent.getUserAgents.useQuery();

  const { data: webhooks } = trpc.webhook.getUserWebhooks.useQuery();

  const handleAgentUpdate = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading agents...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load agents: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Check if user has webhooks
  if (!webhooks || webhooks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Bot className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No webhooks found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You need to create at least one webhook before you can create agents. Agents are triggered by webhook events.
        </p>
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please create a webhook first in the Webhooks section, then return here to create your agents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Bot className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create your first AI agent to automate lead responses and follow-ups. Agents can be triggered by your webhook events.
        </p>
        <AddAgentDialog onAgentAdded={handleAgentUpdate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Agents</h2>
          <p className="text-muted-foreground">
            Manage your AI agents for automated lead responses and follow-ups.
          </p>
        </div>
        <AddAgentDialog onAgentAdded={handleAgentUpdate} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onUpdate={handleAgentUpdate}
          />
        ))}
      </div>

      {agents.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Need another AI agent?
              </p>
              <AddAgentDialog onAgentAdded={handleAgentUpdate} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}