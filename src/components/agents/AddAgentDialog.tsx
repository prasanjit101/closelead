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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, Bot } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/react";
import { agentTypeSchema } from "@/server/db/schema/agent";

const agentFormSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  description: z.string().optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  type: agentTypeSchema,
  webhookIds: z.array(z.string()).min(1, "At least one webhook must be selected"),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

interface AddAgentDialogProps {
  onAgentAdded: () => void;
}

export function AddAgentDialog({ onAgentAdded }: AddAgentDialogProps) {
  const [open, setOpen] = useState(false);
  
  const { data: webhooks } = trpc.webhook.getUserWebhooks.useQuery();
  
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      type: undefined,
      webhookIds: [],
    },
  });

  const createAgentMutation = trpc.agent.create.useMutation({
    onSuccess: () => {
      toast.success("Agent created successfully!");
      form.reset({
        name: "",
        description: "",
        systemPrompt: "",
        type: undefined,
        webhookIds: [],
      });
      setOpen(false);
      onAgentAdded();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create agent");
    },
  });

  const onSubmit = (data: AgentFormData) => {
    createAgentMutation.mutate(data);
  };

  if (!webhooks || webhooks.length === 0) {
    return (
      <Button disabled className="gap-2">
        <Plus className="h-4 w-4" />
        Add Agent
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Create New Agent
          </DialogTitle>
          <DialogDescription>
            Create a new AI agent to automate lead responses and follow-ups. Configure the agent's behavior and trigger webhooks.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lead Response Agent" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your agent a descriptive name to identify its purpose.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this agent does..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of the agent's purpose and functionality.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="response_agent">Response Agent</SelectItem>
                      <SelectItem value="followup_agent">Follow-up Agent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of agent based on its primary function.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Trigger Webhooks</FormLabel>
                    <FormDescription>
                      Select which webhooks should trigger this agent.
                    </FormDescription>
                  </div>
                  <div className="space-y-3">
                    {webhooks.map((webhook) => (
                      <FormField
                        key={webhook.id}
                        control={form.control}
                        name="webhookIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={webhook.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(webhook.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, webhook.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== webhook.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal">
                                  {webhook.name}
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  {webhook.formType} • {webhook.isActive ? 'Active' : 'Inactive'}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful AI assistant that responds to leads..."
                      {...field}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Define how the AI agent should behave and respond to leads.
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
                disabled={createAgentMutation.isPending}
              >
                {createAgentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Agent"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}