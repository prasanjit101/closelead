'use client';
import React, { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check, Plus } from 'lucide-react';
import { trpc } from '@/trpc/react';
import { Project } from '@/server/db/schema';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreateProjectModal } from './CreateProjectModal';
import { Session } from 'auth';
import { useProjectStore } from '@/store/useProjectStore';

interface ProjectSwitcherProps {
  selectedProject?: Project;
  onProjectSelect: (project: Project, mutate?: boolean) => void;
  user: Session['user'];
}

export function ProjectSwitcher({ 
  selectedProject, 
  onProjectSelect,
  user
}: ProjectSwitcherProps) {
  const { data: projects, isPending: loadingProjectsList, refetch: refetchProjectsList } = trpc.project.listProjectsByUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // Zustand store for global project selection
  const { selectedProject: globalSelectedProject, setSelectedProject } = useProjectStore();

  // Maintain a state for the current project using the current project ID from the user
  const [currentProject, setCurrentProject] = useState<Project | undefined>(selectedProject);

  useEffect(() => {
    if (projects && user?.currProjectId) {
      const found = projects.find(p => p.id === user.currProjectId);
      setCurrentProject(found);
      if (found && (!selectedProject || selectedProject.id !== found.id)) {
        onProjectSelect(found, false);
        setSelectedProject(found); // sync Zustand store
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, user?.currProjectId]);

  // Sync local state with Zustand store
  useEffect(() => {
    if (globalSelectedProject && (!currentProject || currentProject.id !== globalSelectedProject.id)) {
      setCurrentProject(globalSelectedProject);
    }
  }, [globalSelectedProject]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {currentProject?.name || "Select Project"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuGroup>
          {
            loadingProjectsList ? (
              <DropdownMenuItem disabled>
                Loading...
              </DropdownMenuItem>
            ) : projects && projects.length > 0 ? (
              projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={() => {
                    setCurrentProject(project);
                    onProjectSelect(project);
                    setSelectedProject(project); // update Zustand store
                  }}
                  className="cursor-pointer"
                >
                  <Check className={`mr-2 h-4 w-4 ${currentProject?.id === project.id ? 'opacity-100' : 'opacity-0'}`} />
                  {project.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                No projects found
              </DropdownMenuItem>
            )
          }
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setCreateModalOpen(true);
              }}
              className="cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </DropdownMenuItem>
          </DialogTrigger>
          <CreateProjectModal onClose={() => { 
            setCreateModalOpen(false); refetchProjectsList();
          }} />
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
