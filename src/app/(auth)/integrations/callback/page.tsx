"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function IntegrationsCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const checkConnectionMutation =
    trpc.integrations.checkConnectionStatus.useMutation();

  useEffect(() => {
    const connectionId = searchParams.get("connectionId");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(`Connection failed: ${error}`);
      toast.error("Failed to connect Gmail");
      return;
    }

    if (!connectionId) {
      setStatus("error");
      setMessage("No connection ID provided");
      toast.error("Invalid callback URL");
      return;
    }

    // Poll for connection status
    const checkConnection = async () => {
      try {
        const result = await checkConnectionMutation.mutateAsync({
          connectionId,
        });

        if (result.isActive) {
          setStatus("success");
          setMessage("Gmail connected successfully!");
          toast.success("Gmail connected successfully!");

          // Redirect to integrations page after a short delay
          setTimeout(() => {
            router.push("/integrations");
          }, 2000);
        } else if (result.status === "ERROR") {
          setStatus("error");
          setMessage("Connection failed. Please try again.");
          toast.error("Gmail connection failed");
        } else {
          // Still pending, check again after a delay
          setTimeout(checkConnection, 2000);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        setStatus("error");
        setMessage("Failed to verify connection status");
        toast.error("Failed to verify connection");
      }
    };

    checkConnection();
  }, [searchParams, checkConnectionMutation, router]);

  const handleRetry = () => {
    router.push("/integrations");
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
            {status === "error" && <XCircle className="h-6 w-6 text-red-600" />}
            Gmail Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{message}</p>

          {status === "loading" && (
            <div className="text-sm text-muted-foreground">
              Verifying your Gmail connection...
            </div>
          )}

          {status === "error" && (
            <Button onClick={handleRetry} className="w-full">
              Back to Integrations
            </Button>
          )}

          {status === "success" && (
            <div className="text-sm text-muted-foreground">
              Redirecting you back to integrations...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
