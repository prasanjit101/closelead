"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Plus, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/react";

const webhookFormSchema = z.object({
  name: z.string().min(1, "Webhook name is required"),
  formType: z.enum(["typeform", "google_forms", "custom", "tally"], {
    required_error: "Please select a form type",
  }),
  webhookSecret: z.string().optional(),
  scoringPrompt: z.string().min(1, "Scoring prompt is required"), // Add scoringPrompt field
});

type WebhookFormData = z.infer<typeof webhookFormSchema>;

interface AddWebhookDialogProps {
  onWebhookAdded: () => void;
}

// Helper function to generate webhook secret
function generateWebhookSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function AddWebhookDialog({ onWebhookAdded }: AddWebhookDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      formType: undefined,
      webhookSecret: generateWebhookSecret(),
      scoringPrompt: "", // Set default value for scoringPrompt
    },
  });

  const createWebhookMutation = trpc.webhook.create.useMutation({
    onSuccess: () => {
      toast.success("Webhook created successfully!");
      form.reset({
        name: "",
        formType: undefined,
        webhookSecret: generateWebhookSecret(),
        scoringPrompt: "", // Reset scoringPrompt
      });
      setOpen(false);
      onWebhookAdded();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Webhook</DialogTitle>
          <DialogDescription>
            Create a new webhook to receive form submissions. A unique URL will be generated for this webhook.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Contact Form Webhook" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of form" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="typeform">Typeform</SelectItem>
                      <SelectItem value="google_forms">Google Forms</SelectItem>
                      <SelectItem value="tally">Tally</SelectItem>
                      <SelectItem value="custom">Custom Form</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the platform where your lead capture form is hosted.
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
                    This secret will be used to verify webhook authenticity. You can generate a new one or use your own.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scoringPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scoring Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Score this lead based on their interest in our product."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a prompt that will be used to score leads from this webhook.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createWebhookMutation.isPending}
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
