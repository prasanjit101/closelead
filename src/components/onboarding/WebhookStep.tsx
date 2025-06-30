"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertWebhookSchema } from "@/server/db/schema/webhook";

type WebhookFormData = z.infer<typeof insertWebhookSchema>;

interface WebhookStepProps {
  onBack: () => void;
  onSuccess: () => void;
}

// Helper function to generate webhook secret
function generateWebhookSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function WebhookStep({ onBack, onSuccess }: WebhookStepProps) {
  const form = useForm<WebhookFormData>({
    resolver: zodResolver(insertWebhookSchema),
    defaultValues: {
      name: "",
      webhookSecret: generateWebhookSecret(),
    },
  });

  const createWebhookMutation = trpc.webhook.create.useMutation({
    onSuccess: () => {
      onSuccess();
      toast.success("Webhook created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create webhook");
    },
  });

  const onSubmit = (data: WebhookFormData) => {
    createWebhookMutation.mutate(data);
  };

  const handleGenerateSecret = () => {
    const newSecret = generateWebhookSecret();
    form.setValue("webhookSecret", newSecret);
    toast.success("New secret generated");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create Your First Webhook</CardTitle>
          <CardDescription>
            Connect your lead capture forms to start receiving leads
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Contact Form Webhook"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Give your webhook a descriptive name to identify it later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="formType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the type of form" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="custom">Custom Form</SelectItem>
                        <SelectItem value="tally">Tally</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the platform where your lead capture form is
                      hosted.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webhookSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook Secret</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Webhook secret for verification"
                          {...field}
                          value={field.value ?? ""}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateSecret}
                        className="shrink-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      This secret will be used to verify webhook authenticity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={createWebhookMutation.isPending}
                  className="flex-1"
                >
                  {createWebhookMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Webhook"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
