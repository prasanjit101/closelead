"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import {
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  X,
  ExternalLink,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/react";
import type { Webhook, WebhookUpdate } from "@/server/db/schema";
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
} from "@/components/ui/alert-dialog"; // Correct import path

interface WebhookCardProps {
  webhook: Webhook;
  onUpdate: () => void;
}

const formTypeLabels = {
  custom: "Custom",
  tally: "Tally",
};

export function WebhookCard({ webhook, onUpdate }: WebhookCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [editData, setEditData] = useState({
    name: webhook.name,
    formType: webhook.formType as Webhook['formType'],
    webhookSecret: webhook.webhookSecret || "",
    scoringPrompt: webhook.scoringPrompt || "", // Add scoringPrompt
    isActive: webhook.isActive || false,
  });

  const updateMutation = trpc.webhook.update.useMutation({
    onSuccess: () => {
      toast.success("Webhook updated successfully");
      setIsEditing(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update webhook");
    },
  });

  const deleteMutation = trpc.webhook.delete.useMutation({
    onSuccess: () => {
      toast.success("Webhook deleted successfully");
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete webhook");
    },
  });

  const regenerateSecretMutation = trpc.webhook.regenerateSecret.useMutation({
    onSuccess: (updatedWebhook) => {
      toast.success("Webhook secret regenerated successfully");
      setEditData((prev) => ({
        ...prev,
        webhookSecret: updatedWebhook.webhookSecret || "",
      }));
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to regenerate secret");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: webhook.id,
      name: editData.name,
      formType: editData.formType,
      webhookSecret: editData.webhookSecret,
      scoringPrompt: editData.scoringPrompt, // Include scoringPrompt in update
      isActive: editData.isActive,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: webhook.id });
  };

  const handleRegenerateSecret = () => {
    regenerateSecretMutation.mutate({ id: webhook.id });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleCancel = () => {
    setEditData({
      name: webhook.name,
      formType: webhook.formType as Webhook['formType'],
      webhookSecret: webhook.webhookSecret || "",
      scoringPrompt: webhook.scoringPrompt || "", // Reset scoringPrompt
      isActive: webhook.isActive || false,
    });
    setIsEditing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="flex-1">
                <Label htmlFor="webhook-name" className="text-sm font-medium">
                  Webhook Name
                </Label>
                <Input
                  id="webhook-name"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1"
                  placeholder="Enter webhook name"
                />
              </div>
            ) : (
              <div>
                <CardTitle className="text-lg">{webhook.name}</CardTitle>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                      className="rounded-full text-xs"
                      variant="secondary"
                  >
                    {
                      formTypeLabels[
                        webhook.formType as keyof typeof formTypeLabels
                      ]
                    }
                  </Badge>
                    <Badge className="rounded-full text-xs" variant={webhook.isActive ? "default" : "outline"}>
                    {webhook.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="h-8"
                >
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="h-8"
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                    size="icon"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-8"
                >
                    <Edit className="mr-1 h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button size="icon" variant="destructive" className="h-8">
                        <Trash2 className="mr-1 h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{webhook.name}"? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="hover:bg-destructive/90 bg-destructive text-destructive-foreground"
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
        {isEditing && (
          <>
            <div className="flex gap-4 w-full">
              <div>
                <Label htmlFor="form-type" className="text-sm font-medium">
                  Form Type
                </Label>
                <Select
                  value={editData.formType}
                  onValueChange={(value) =>
                    setEditData((prev) => ({
                      ...prev,
                      formType: value as Webhook['formType'],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1 w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tally">Tally</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {
              isEditing && (
                <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={editData.isActive}
                  onCheckedChange={(checked) =>
                    setEditData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="is-active" className="text-sm font-medium">
                  Active
                </Label>
                </div> 
              )
            }

            <div>
              <Label htmlFor="scoring-prompt" className="text-sm font-medium">
                Scoring Prompt
              </Label>
              <Textarea
                id="scoring-prompt"
                rows={4}
                value={editData.scoringPrompt}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    scoringPrompt: e.target.value,
                  }))
                }
                className="mt-1"
                placeholder="Enter scoring prompt"
              />
            </div>
            <Separator />
          </>
        )}

        {/* Webhook URL */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4" />
              Webhook URL
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={webhook.webhookUrl}
              readOnly
              className="bg-muted font-mono text-sm"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(webhook.webhookUrl, "Webhook URL")}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Webhook Secret */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-sm font-medium">Webhook Secret</Label>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSecret(!showSecret)}
                className="h-6 px-2"
              >
                {showSecret ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  copyToClipboard(webhook.webhookSecret || "", "Webhook Secret")
                }
                className="h-6 px-2"
              >
                <Copy className="h-3 w-3" />
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRegenerateSecret}
                  disabled={regenerateSecretMutation.isPending}
                  className="h-6 px-2"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${regenerateSecretMutation.isPending ? "animate-spin" : ""}`}
                  />
                </Button>
              )}
            </div>
          </div>
          {isEditing ? (
            <Input
              value={editData.webhookSecret}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  webhookSecret: e.target.value,
                }))
              }
              type={showSecret ? "text" : "password"}
              className="font-mono text-sm"
              placeholder="Enter webhook secret"
            />
          ) : (
            <Input
              value={
                showSecret ? webhook.webhookSecret || "" : "••••••••••••••••"
              }
              readOnly
              className="bg-muted font-mono text-sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
