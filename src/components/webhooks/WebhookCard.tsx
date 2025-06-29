"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/trpc/react";
import type { Webhook } from "@/server/db/schema";
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
} from "@/components/ui/dialog";

interface WebhookCardProps {
  webhook: Webhook;
  onUpdate: () => void;
}

const formTypeLabels = {
  typeform: "Typeform",
  google_forms: "Google Forms",
  custom: "Custom",
  tally: "Tally",
};

const formTypeColors = {
  typeform: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  google_forms: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  tally: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function WebhookCard({ webhook, onUpdate }: WebhookCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [editData, setEditData] = useState({
    name: webhook.name,
    formType: webhook.formType as "typeform" | "google_forms" | "custom" | "tally",
    webhookSecret: webhook.webhookSecret || "",
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
      setEditData(prev => ({ ...prev, webhookSecret: updatedWebhook.webhookSecret || "" }));
      onUpdate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to regenerate secret");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: webhook.id,
      ...editData,
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
      formType: webhook.formType as "typeform" | "google_forms" | "custom" | "tally",
      webhookSecret: webhook.webhookSecret || "",
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
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter webhook name"
                />
              </div>
            ) : (
              <div>
                <CardTitle className="text-lg">{webhook.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={formTypeColors[webhook.formType as keyof typeof formTypeColors]}
                  >
                    {formTypeLabels[webhook.formType as keyof typeof formTypeLabels]}
                  </Badge>
                  <Badge variant={webhook.isActive ? "default" : "secondary"}>
                    {webhook.isActive ? "Active" : "Inactive"}
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
                      <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{webhook.name}"? This action cannot be undone.
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
        {isEditing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="form-type" className="text-sm font-medium">
                  Form Type
                </Label>
                <Select
                  value={editData.formType}
                  onValueChange={(value) => setEditData(prev => ({ 
                    ...prev, 
                    formType: value as "typeform" | "google_forms" | "custom" | "tally"
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typeform">Typeform</SelectItem>
                    <SelectItem value="google_forms">Google Forms</SelectItem>
                    <SelectItem value="tally">Tally</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
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
            <Separator />
          </>
        )}

        {/* Webhook URL */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Webhook URL
            </Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(webhook.webhookUrl, "Webhook URL")}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={webhook.webhookUrl}
              readOnly
              className="font-mono text-sm bg-muted"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(webhook.webhookUrl, '_blank')}
              className="h-9 px-3"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Webhook Secret */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Webhook Secret</Label>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSecret(!showSecret)}
                className="h-6 px-2"
              >
                {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(webhook.webhookSecret || "", "Webhook Secret")}
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
                  <RefreshCw className={`h-3 w-3 ${regenerateSecretMutation.isPending ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>
          {isEditing ? (
            <Input
              value={editData.webhookSecret}
              onChange={(e) => setEditData(prev => ({ ...prev, webhookSecret: e.target.value }))}
              type={showSecret ? "text" : "password"}
              className="font-mono text-sm"
              placeholder="Enter webhook secret"
            />
          ) : (
            <Input
              value={showSecret ? webhook.webhookSecret : "••••••••••••••••"}
              readOnly
              className="font-mono text-sm bg-muted"
            />
          )}
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="flex justify-between">
            <span>Created: {new Date(webhook.createdAt).toLocaleDateString()}</span>
            <span>ID: {webhook.id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}