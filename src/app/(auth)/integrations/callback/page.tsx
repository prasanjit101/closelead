"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function IntegrationCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const handleCallbackMutation =
    trpc.integrations.handleConnectionCallback.useMutation({
      onSuccess: (result) => {
        if (result.success) {
          setStatus("success");
          setMessage("Gmail integration connected successfully!");
          toast.success("Gmail integration connected successfully!");
          setTimeout(() => {
            router.push("/integrations");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(result.error || "Connection failed");
          toast.error("Failed to connect Gmail integration");
        }
      },
      onError: (error) => {
        setStatus("error");
        setMessage(error.message);
        toast.error("Failed to process connection callback");
      },
    });

  useEffect(() => {
    const connectionId = searchParams.get("connectionId");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (!connectionId) {
      setStatus("error");
      setMessage("Missing connection ID");
      return;
    }

    // Handle the callback
    handleCallbackMutation.mutate({
      connectionId,
      status: error ? "error" : "success",
      error: error || undefined,
    });
  }, [searchParams, handleCallbackMutation]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            {status === "loading" && (
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            )}
            {status === "success" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            {status === "error" && (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Processing Connection..."}
            {status === "success" && "Connection Successful!"}
            {status === "error" && "Connection Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground">{message}</p>

          {status !== "loading" && (
            <Button
              onClick={() => router.push("/integrations")}
              className="w-full"
            >
              Return to Integrations
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
