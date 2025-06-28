import { Project, TaskInsert } from "@/server/db/schema";
import { Session } from "auth";
import { useEffect, useState } from "react";
import { TaskSheetProps } from "./task-props";

export function useTaskForm(
  initialTaskData: TaskSheetProps['initialTaskData'],
  project: Project,
  session: Session
) {
  const initialTaskFormData: TaskInsert = {
    projectId: project.id!,
    details: '',
    priority: 'Auto',
    customFields: [],
    status: "Planned",
    useAi: false,
  };

  const [formData, setFormData] = useState<TaskInsert>(initialTaskFormData);

  useEffect(() => {
    if (initialTaskData) {
      setFormData(initialTaskData as TaskInsert);
    } else {
      setFormData(initialTaskFormData);
    }
    // eslint-disable-next-line
  }, [initialTaskData, project?.id, session?.user.id]);

  return { formData, setFormData, initialTaskFormData };
}