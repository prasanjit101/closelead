"use client";

import { trpc } from "@/trpc/react";
import { GmailIntegrationCard } from "./GmailIntegrationCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plug, AlertCircle } from "lucide-react";
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
          <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
          <p className="text-muted-foreground">
            Connect your favorite tools to automate your lead management
            workflow.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Gmail Integration */}
        <GmailIntegrationCard
          integration={gmailIntegration}
          onUpdate={handleIntegrationUpdate}
        />

        {/* Coming Soon Integrations */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Outlook",
              description: "Send emails through Microsoft Outlook",
              icon: "📧",
              status: "coming_soon",
            },
            {
              name: "Slack",
              description: "Send notifications to Slack channels",
              icon: "💬",
              status: "coming_soon",
            },
            {
              name: "Discord",
              description: "Send notifications to Discord servers",
              icon: "🎮",
              status: "coming_soon",
            },
            {
              name: "Webhooks",
              description: "Send data to custom webhook endpoints",
              icon: "🔗",
              status: "coming_soon",
            },
            {
              name: "Zapier",
              description: "Connect with 5000+ apps via Zapier",
              icon: "⚡",
              status: "coming_soon",
            },
            {
              name: "HubSpot",
              description: "Sync leads with HubSpot CRM",
              icon: "🎯",
              status: "coming_soon",
            },
          ].map((integration) => (
            <Card key={integration.name} className="opacity-60">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Coming Soon
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Plug className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              Need a Custom Integration?
            </h3>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              We're constantly adding new integrations. If you need a specific
              integration, let us know and we'll prioritize it.
            </p>
            <a
              href="mailto:support@closelead.com"
              className="text-sm font-medium text-primary hover:underline"
            >
              Request Integration
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
