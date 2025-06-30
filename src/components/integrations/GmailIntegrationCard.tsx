"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Send,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GmailIntegrationCardProps {
  integration?: Integration;
  onUpdate: () => void;
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
  onUpdate,
}: GmailIntegrationCardProps) {
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState("Test Email from Closelead");
  const [testBody, setTestBody] = useState(
    "This is a test email sent from your Closelead Gmail integration. If you received this, your integration is working correctly!",
  );

  const initiateConnectionMutation =
    trpc.integrations.initiateGmailConnection.useMutation({
      onSuccess: (result) => {
        // Redirect to Composio OAuth flow
        window.location.href = result.redirectUrl;
      },
      onError: (error) => {
        toast.error(error.message || "Failed to initiate Gmail connection");
      },
    });

  const disconnectMutation =
    trpc.integrations.disconnectIntegration.useMutation({
      onSuccess: () => {
        toast.success("Gmail integration disconnected successfully");
        onUpdate();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to disconnect Gmail integration");
      },
    });

  const testConnectionMutation = trpc.integrations.testConnection.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Gmail connection is working correctly");
      } else {
        toast.error("Gmail connection test failed");
      }
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to test Gmail connection");
    },
  });

  const sendTestEmailMutation = trpc.integrations.sendTestEmail.useMutation({
    onSuccess: () => {
      toast.success("Test email sent successfully!");
      setShowTestDialog(false);
      setTestEmail("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send test email");
    },
  });

  const handleConnect = () => {
    initiateConnectionMutation.mutate();
  };

  const handleDisconnect = () => {
    if (integration) {
      disconnectMutation.mutate({ id: integration.id });
    }
  };

  const handleTestConnection = () => {
    if (integration) {
      testConnectionMutation.mutate({ id: integration.id });
    }
  };

  const handleSendTestEmail = () => {
    if (integration && testEmail) {
      sendTestEmailMutation.mutate({
        integrationId: integration.id,
        to: testEmail,
        subject: testSubject,
        body: testBody,
      });
    }
  };

  const status = integration?.status || "disconnected";
  const StatusIcon =
    statusConfig[status as keyof typeof statusConfig]?.icon || XCircle;
  const statusColor = statusConfig[status as keyof typeof statusConfig]?.color;
  const statusLabel = statusConfig[status as keyof typeof statusConfig]?.label;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <Mail className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                Gmail Integration
                <StatusIcon
                  className={`h-4 w-4 ${status === "pending" ? "animate-spin" : ""}`}
                />
              </CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge className={statusColor}>{statusLabel}</Badge>
                {integration?.lastSyncAt && (
                  <span className="text-xs text-muted-foreground">
                    Last sync:{" "}
                    {new Date(integration.lastSyncAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === "connected" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testConnectionMutation.isPending}
                  className="h-8"
                >
                  <TestTube className="mr-1 h-4 w-4" />
                  Test
                </Button>
                <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8">
                      <Send className="mr-1 h-4 w-4" />
                      Send Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Test Email</DialogTitle>
                      <DialogDescription>
                        Send a test email to verify your Gmail integration is
                        working correctly.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="test-email">Recipient Email</Label>
                        <Input
                          id="test-email"
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="test@example.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="test-subject">Subject</Label>
                        <Input
                          id="test-subject"
                          value={testSubject}
                          onChange={(e) => setTestSubject(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="test-body">Message</Label>
                        <Textarea
                          id="test-body"
                          value={testBody}
                          onChange={(e) => setTestBody(e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowTestDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSendTestEmail}
                        disabled={!testEmail || sendTestEmailMutation.isPending}
                      >
                        {sendTestEmailMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Test Email
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="h-8">
                      <Unplug className="mr-1 h-4 w-4" />
                      Disconnect
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Disconnect Gmail Integration
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to disconnect your Gmail
                        integration? This will stop all automated email sending
                        through Gmail.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDisconnect}
                        className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
                      >
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={initiateConnectionMutation.isPending}
                className="h-8"
              >
                {initiateConnectionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Connect Gmail
                  </>
                )}
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
            integration uses Composio to securely connect with Gmail's API.
          </p>
        </div>

        <Separator />

        {/* Features */}
        <div>
          <h4 className="mb-3 text-sm font-medium">Features</h4>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Send automated follow-up emails</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Personalized email content</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Lead scoring integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Email delivery tracking</span>
            </div>
          </div>
        </div>

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

        {/* Connection Info */}
        {integration && (
          <>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>
                  Created:{" "}
                  {new Date(integration.createdAt).toLocaleDateString()}
                </span>
                <span>ID: {integration.id}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
