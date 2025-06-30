"use client";

import { trpc } from "@/trpc/react";
import { WebhookCard } from "./WebhookCard";
import { AddWebhookDialog } from "./AddWebhookDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Webhook, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function WebhooksList() {
  const {
    data: webhooks,
    isLoading,
    error,
    refetch,
  } = trpc.webhook.getUserWebhooks.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleWebhookUpdate = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading webhooks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load webhooks: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!webhooks || webhooks.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Webhook className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No webhooks yet</h3>
        <p className="mx-auto mb-6 max-w-md text-muted-foreground">
          Create your first webhook to start receiving form submissions and
          managing leads automatically.
        </p>
        <AddWebhookDialog onWebhookAdded={handleWebhookUpdate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Webhooks</h2>
          <p className="text-muted-foreground text-sm">
            Manage your webhook endpoints for receiving form submissions.
          </p>
        </div>
        <AddWebhookDialog onWebhookAdded={handleWebhookUpdate} />
      </div>

      <div className="grid gap-6">
        {webhooks.map((webhook) => (
          <WebhookCard
            key={webhook.id}
            webhook={webhook}
            onUpdate={handleWebhookUpdate}
          />
        ))} 
      </div>
    </div>
  );
}
