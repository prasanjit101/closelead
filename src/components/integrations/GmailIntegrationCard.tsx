"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Unplug,
  TestTube,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/react";
import type { Integration } from "@/server/db/schema/integrations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GmailIntegrationCardProps {
  integration?: Integration;
}

const statusConfig = {
  connected: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    label: "Connected",
  },
  disconnected: {
    icon: XCircle,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    label: "Disconnected",
  },
  error: {
    icon: AlertCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    label: "Error",
  },
  pending: {
    icon: Loader2,
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    label: "Connecting...",
  },
};

export function GmailIntegrationCard({
  integration,
}: GmailIntegrationCardProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const utils = trpc.useUtils();

  const initiateConnectionMutation =
    trpc.integrations.initiateGmailConnection.useMutation({
      onSuccess: (data) => {
        // Redirect to Composio OAuth URL
        window.location.href = data.redirectUrl;
      },
      onError: (error) => {
        toast.error("Failed to initiate Gmail connection");
        console.error("Connection error:", error);
        setIsConnecting(false);
      },
    });

  const disconnectMutation = trpc.integrations.disconnectGmail.useMutation({
    onSuccess: () => {
      toast.success("Gmail disconnected successfully");
      utils.integrations.getUserIntegrations.invalidate();
      setIsDisconnecting(false);
    },
    onError: (error) => {
      toast.error("Failed to disconnect Gmail");
      console.error("Disconnect error:", error);
      setIsDisconnecting(false);
    },
  });

  const testConnectionMutation =
    trpc.integrations.testGmailConnection.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Gmail connection is working!");
        } else {
          toast.error("Gmail connection test failed");
        }
        setIsTesting(false);
      },
      onError: (error) => {
        toast.error("Failed to test Gmail connection");
        console.error("Test error:", error);
        setIsTesting(false);
      },
    });

  const status = integration?.status || "disconnected";
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const handleConnect = async () => {
    setIsConnecting(true);
    initiateConnectionMutation.mutate();
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    disconnectMutation.mutate();
  };

  const handleTest = async () => {
    setIsTesting(true);
    testConnectionMutation.mutate();
  };

  const isLoading = isConnecting || isDisconnecting || isTesting;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <img src="/gmail.svg" alt="Gmail" width={24} height={24} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                Gmail Integration
                <Badge
                  variant="outline"
                  className={`ml-2 rounded-full ${statusInfo.color}`}
                >
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusInfo.label}
                </Badge>
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === "connected" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                  Test
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      {isDisconnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Unplug className="h-4 w-4" />
                      )}
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Gmail</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to disconnect your Gmail account?
                        This will stop all automated email functionality.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDisconnect}>
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {status !== "connected" && (
              <Button
                onClick={handleConnect}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Connect Gmail
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground">
            Connect your Gmail account to send automated emails to leads. This
            integration uses Composio to securely connect with Gmail&apos;s API.
          </p>
        </div>

        {/* Connection Details */}
        {integration && status === "connected" && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Connection Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium text-green-600">
                    Active
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Connected:</span>
                  <span className="ml-2 font-medium">
                    {integration.createdAt?.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error Message */}
        {integration?.errorMessage && (
          <>
            <Separator />
            <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Connection Error</span>
              </div>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {integration.errorMessage}
              </p>
            </div>
          </>
        )}

        {/* Capabilities */}
        <Separator />
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Capabilities</h4>
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send automated follow-up emails
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send personalized outreach emails
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Track email delivery status
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
