"use client";

import { trpc } from "@/trpc/react";
import { GmailIntegrationCard } from "./GmailIntegrationCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function IntegrationsList() {
  const {
    data: integrations,
    isLoading,
    error,
    refetch,
  } = trpc.integrations.getUserIntegrations.useQuery();

  const handleIntegrationUpdate = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading integrations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load integrations: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const gmailIntegration = integrations?.find((i) => i.type === "gmail");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect your favorite tools to automate your lead management
            workflow.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Gmail Integration */}
        <GmailIntegrationCard integration={gmailIntegration} />
      </div>
    </div>
  );
}
