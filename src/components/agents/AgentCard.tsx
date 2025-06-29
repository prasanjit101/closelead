"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Trash2, 
  Save, 
  X,
  Bot,
  Webhook,
  MessageSquare,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/react";
import type { AgentWithWebhooks } from "@/server/db/schema/agent";
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

interface AgentCardProps {
  agent: AgentWithWebhooks;
  onUpdate: () => void;
}

const agentTypeLabels = {
  response_agent: "Response Agent",
  followup_agent: "Follow-up Agent",
};

const agentTypeColors = {
  response_agent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  followup_agent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const agentTypeIcons = {
  response_agent: MessageSquare,
  followup_agent: UserCheck,
};

export function AgentCard({ agent, onUpdate }: AgentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: agent.name,
    description: agent.description || "",
    systemPrompt: agent.systemPrompt,
    type: agent.type as "response_agent" | "followup_agent",
    webhookIds: agent.webhooks.map(w => w.id),
    isActive: agent.isActive || false,
  });

  const { data: webhooks } = trpc.webhook.getUserWebhooks.useQuery();

  const updateMutation = trpc.agent.update.useMutation({
    onSuccess: () => {
      toast.success("Agent updated successfully");
      setIsEditing(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update agent");
    },
  });

  const deleteMutation = trpc.agent.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted successfully");
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete agent");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: agent.id,
      name: editData.name,
      description: editData.description,
      systemPrompt: editData.systemPrompt,
      type: editData.type,
      webhookIds: editData.webhookIds,
      isActive: editData.isActive,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: agent.id });
  };

  const handleCancel = () => {
    setEditData({
      name: agent.name,
      description: agent.description || "",
      systemPrompt: agent.systemPrompt,
      type: agent.type as "response_agent" | "followup_agent",
      webhookIds: agent.webhooks.map(w => w.id),
      isActive: agent.isActive || false,
    });
    setIsEditing(false);
  };

  const TypeIcon = agentTypeIcons[agent.type as keyof typeof agentTypeIcons];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            {isEditing ? (
              <div className="flex-1">
                <Label htmlFor="agent-name" className="text-sm font-medium">
                  Agent Name
                </Label>
                <Input
                  id="agent-name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter agent name"
                />
              </div>
            ) : (
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {agent.name}
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={agentTypeColors[agent.type as keyof typeof agentTypeColors]}
                  >
                    {agentTypeLabels[agent.type as keyof typeof agentTypeLabels]}
                  </Badge>
                  <Badge variant={agent.isActive ? "default" : "secondary"}>
                    {agent.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="h-8"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-8"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{agent.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <Label className="text-sm font-medium">Description</Label>
          {isEditing ? (
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1"
              placeholder="Enter agent description"
              rows={2}
            />
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              {agent.description || "No description provided"}
            </p>
          )}
        </div>

        {isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="agent-type" className="text-sm font-medium">
                  Agent Type
                </Label>
                <Select
                  value={editData.type}
                  onValueChange={(value) => setEditData(prev => ({ 
                    ...prev, 
                    type: value as "response_agent" | "followup_agent"
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="response_agent">Response Agent</SelectItem>
                    <SelectItem value="followup_agent">Follow-up Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={editData.isActive}
                  onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="is-active" className="text-sm font-medium">
                  Active
                </Label>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Trigger Webhooks</Label>
              <div className="mt-2 space-y-2">
                {webhooks?.map((webhook) => (
                  <div key={webhook.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`webhook-${webhook.id}`}
                      checked={editData.webhookIds.includes(webhook.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditData(prev => ({
                            ...prev,
                            webhookIds: [...prev.webhookIds, webhook.id]
                          }));
                        } else {
                          setEditData(prev => ({
                            ...prev,
                            webhookIds: prev.webhookIds.filter(id => id !== webhook.id)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`webhook-${webhook.id}`} className="text-sm">
                      {webhook.name} ({webhook.formType})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Trigger Webhooks */}
        {!isEditing && (
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Trigger Webhooks
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {agent.webhooks.length > 0 ? (
                agent.webhooks.map((webhook) => (
                  <Badge key={webhook.id} variant="outline" className="text-xs">
                    {webhook.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No webhooks configured</span>
              )}
            </div>
          </div>
        )}

        {/* System Prompt */}
        <div>
          <Label className="text-sm font-medium">System Prompt</Label>
          {isEditing ? (
            <Textarea
              value={editData.systemPrompt}
              onChange={(e) => setEditData(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="mt-1 font-mono text-sm"
              placeholder="Enter system prompt"
              rows={4}
            />
          ) : (
            <div className="mt-1 p-3 bg-muted rounded-md">
              <p className="text-sm font-mono whitespace-pre-wrap">
                {agent.systemPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="flex justify-between">
            <span>Created: {new Date(agent.createdAt).toLocaleDateString()}</span>
            <span>ID: {agent.id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}