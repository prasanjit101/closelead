'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/trpc/react';
import { toast } from 'sonner';
import { Templates, type CustomFieldsMetadata } from '@/server/db/schema/templates';
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toInputName } from '@/lib/utils';

interface CustomFieldsDialogProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialField?: Templates;
  trigger?: React.ReactNode;
}

export const CustomFieldsDialog = ({
  projectId,
  isOpen,
  onOpenChange,
  initialField,
  trigger
}: CustomFieldsDialogProps) => {
  const [fields, setFields] = useState<CustomFieldsMetadata[]>([]);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (isOpen) {
      setFields(initialField?.template ?? []);
    }
  }, [isOpen, initialField]);

  const { mutate: updateFields } = trpc.customField.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success('Custom fields saved successfully');
      utils.customField.getTemplatesByProject.invalidate({ projectId });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleCancel = () => {
    setFields(initialField?.template ?? []);
    onOpenChange(false);
  };

  const handleAddField = () => {
    setFields([...fields, { label: '', name: '', prompt: '' }]);
  };

  const handleFieldChange = (index: number, field: Partial<CustomFieldsMetadata>) => {
    const updated = [...fields];
    const currentField = fields[index];
    if (!currentField) return;
    
    updated[index] = { 
      label: field.label ?? currentField.label,
      name: field.name ?? currentField.name,
      prompt: field.prompt ?? currentField.prompt 
    };
    setFields(updated);
  };

  const handleRemoveField = (index: number) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const handleSave = () => {
    const updatedFields = fields.map((field) => ({
      ...field,
      name: toInputName(field.label),
    }));
    updateFields({ projectId, template: updatedFields, id: initialField?.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Custom Fields</DialogTitle>
          <DialogDescription>
            Add or edit custom fields for this project
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Custom Fields</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddField}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>
          {fields.map((field, index) => (
            <Card key={index} className="p-4 space-y-3 relative">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => handleRemoveField(index)}
                aria-label="Remove field"
              >
                <span className="sr-only">Remove</span>
                <X />
              </Button>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-sm">Label</label>
                  <Textarea
                    placeholder="Display label"
                    value={field.label}
                    onChange={(e) =>
                      handleFieldChange(index, { label: e.target.value })
                    }
                    className='resize-none'
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-sm">Prompt</label>
                  <Textarea
                    placeholder="AI prompt for this field"
                    value={field.prompt ?? ''}
                    onChange={(e) =>
                      handleFieldChange(index, { prompt: e.target.value })
                    }
                    className='resize-none'
                />
              </div>
              </div>
            </Card>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No custom fields added yet
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
