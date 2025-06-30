"use client";

import { trpc } from "@/trpc/react";
import { AgentCard } from "./AgentCard";
import { AddAgentDialog } from "./AddAgentDialog";
import { Loader2, Bot, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AgentsList() {
  const {
    data: agents,
    isLoading,
    error,
    refetch,
  } = trpc.agent.getUserAgents.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: webhooks } = trpc.webhook.getUserWebhooks.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

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
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Bot className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No webhooks found</h3>
        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
          You need to create at least one webhook before you can create agents.
          Agents are triggered by webhook events.
        </p>
        <Alert className="mx-auto max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please create a webhook first in the Webhooks section, then return
            here to create your agents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Bot className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No agents yet</h3>
        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
          Create your first AI agent to automate lead responses and follow-ups.
          Agents can be triggered by your webhook events.
        </p>
        <AddAgentDialog onAgentAdded={handleAgentUpdate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Agents</h2>
          <p className="text-sm text-muted-foreground">
            Manage your AI agents for automated lead responses and follow-ups.
          </p>
        </div>
        <AddAgentDialog onAgentAdded={handleAgentUpdate} />
      </div>

      <div className="flex flex-col gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onUpdate={handleAgentUpdate}
          />
        ))}
      </div>
    </div>
  );
}
