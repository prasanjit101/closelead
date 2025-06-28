import { Project, Task } from "@/server/db/schema";
import { ProjectMember } from "@/types/dashboard.types";
import { Session } from "auth";

export interface TaskSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTaskData?: Task & { useAi?: boolean };
  members: ProjectMember[];
  trigger?: React.ReactNode;
  project: Project;
  session: Session;
}