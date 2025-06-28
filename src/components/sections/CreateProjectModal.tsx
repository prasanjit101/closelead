import React, { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { trpc } from '@/trpc/react';

interface CreateProjectModalProps {
  onClose: () => void;
}

export function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const { mutate: createProject, isPending: isCreatingProject } = trpc.project.createProject.useMutation({
    onSuccess: (_) => {
      toast.success("Project created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(`Error creating project: ${error.message}`);
    },
  });

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    createProject({ name: projectName, description: projectDescription });
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Enter the project name and click &quot;Create Project&quot; to create a new project.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="project-name">Project Name</Label>
          <Input
            id="project-name"
            type="text"
            placeholder="Enter project name"
            required
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
          />
        </div>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="project-description">Project Description</Label>
          <Textarea
            id="project-description"
            placeholder="Enter project description"
            required
            value={projectDescription}
            onChange={e => setProjectDescription(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DialogClose>
        <Button disabled={isCreatingProject} type="button" onClick={handleCreateProject}>
          Creat{isCreatingProject ? 'ing' : ''} Project
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
