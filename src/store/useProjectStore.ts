import { create } from 'zustand';
import { Project } from '@/server/db/schema';

interface ProjectStoreState {
  selectedProject?: Project;
  setSelectedProject: (project?: Project) => void;
}

export const useProjectStore = create<ProjectStoreState>((set) => ({
  selectedProject: undefined,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));
