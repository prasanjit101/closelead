'use client';

import { useReducer, memo, useEffect, useState, useCallback } from 'react';
import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { TaskSheet } from './TaskSheet';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/ui/kibo-ui/kanban';
import type { DragEndEvent } from '@/components/ui/kibo-ui/kanban';
import { trpc } from '@/trpc/react';
import type { Task, TaskStatus } from '@/server/db/schema/task';
import { LoadingProject } from './LoadingComponent';
import { taskStatuses } from '@/utils/tasks';
import { KanbanBoardProps } from '@/types/dashboard.types';
import { ProjectMemberRoles } from '@/utils/permissions';
import { GripVertical } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn, TaskPriorityToBadgeVariant } from '@/lib/utils';
import { useDateFormatters } from '@/hooks/use-date';
import { toast } from 'sonner';


interface TaskRowProps {
  task: Task
  index: number
  onClick?: (task: Task) => void
}

const TaskRow = memo(({ task, index, onClick }: TaskRowProps) => {
  const { shortDateFormatter, dateFormatter } = useDateFormatters();

  return (
    <div onClick={() => onClick?.(task)} className='cursor-pointer'>
      <KanbanCard
        key={task.id}
        id={task.id}
        name={task.title}
        parent={task.status}
        index={index}
        className='space-y-2'
        dragHandle={
          <GripVertical className='w-4 h-4 text-muted-foreground' />
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <Badge variant={TaskPriorityToBadgeVariant(task?.priority ?? 'medium')} className={cn('rounded-lg')}>{task?.priority ?? 'N/A'}</Badge>
          </div>
          <p className="text-xs truncate">
            {task?.details && task?.details?.length > 100 ? `${task.details.slice(0, 200)}...` : task.details}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {task.startAt ? shortDateFormatter.format(task.startAt) : ''}
              {task.endAt ? ' -> ' + dateFormatter.format(task.endAt) : ''}
            </span>
          </div>
        </div>
      </KanbanCard>
    </div>
  );
});

type DashboardState = {
  tasks: Task[];
  loading: boolean;
  filteredTasks: Record<string, Task[]>;
};

type DashboardAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: TaskStatus } };

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_TASKS': {
      const filteredTasks = taskStatuses.reduce((acc, status) => {
        acc[status.name] = action.payload.filter((task) => task.status === status.name);
        return acc;
      }, {} as Record<string, Task[]>);
      return { ...state, tasks: action.payload, filteredTasks, loading: false };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_TASK_STATUS': {
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.payload.taskId ? { ...task, status: action.payload.status } : task
      );
      const filteredTasks = taskStatuses.reduce((acc, status) => {
        acc[status.name] = updatedTasks.filter((task) => task.status === status.name);
        return acc;
      }, {} as Record<string, Task[]>);
      return { ...state, tasks: updatedTasks, filteredTasks };
    }
    default:
      return state;
  }
};


// Memoize the component to prevent unnecessary re-renders
const BoardView = memo(function BoardView({ project, currentUserRole, members, session }: KanbanBoardProps & { currentUserRole: ProjectMemberRoles }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
      bypassActivationConstraint: ({ activeNode, event }) => {
        const target = event.target as HTMLElement;
        return !activeNode.activatorNode.current?.contains(target);
      },
    })
  );
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const handleTaskCardClick = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskSheetOpen(true);
  }, []);

  const handleTaskSheetClose = () => {
    setIsTaskSheetOpen(false);
    setEditingTask(undefined);
  };

  const { data: tasks, isLoading: loadingTasks } = trpc.task.listTasksByProject.useQuery({ projectId: project?.id! }, { enabled: !!project?.id, refetchOnWindowFocus: false });
  const [state, dispatch] = useReducer(dashboardReducer, {
    tasks: [],
    loading: false,
    filteredTasks: {}
  });

  const utils = trpc.useUtils();
  const { dateFormatter, shortDateFormatter } = useDateFormatters();

  const updateTaskStatus = trpc.task.updateTaskStatus.useMutation({
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await utils.task.listTasksByProject.cancel({ projectId: project?.id! });

      // Snapshot the previous value
      const previousTasks = utils.task.listTasksByProject.getData({ projectId: project?.id! });

      // Optimistically update to the new value
      utils.task.listTasksByProject.setData(
        { projectId: project?.id! },
        (old) => old?.map(task =>
          task.id === newTask.id ? { ...task, status: newTask.status as TaskStatus } : task
        )
      );

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Rollback to previous value on error
      utils.task.listTasksByProject.setData(
        { projectId: project?.id! },
        context?.previousTasks
      );
      toast.error('Error updating task status ' + err.message);
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.task.listTasksByProject.invalidate({ projectId: project?.id! });
    }
  });


  // Update local state when fetched tasks change
  useEffect(() => {
    if (tasks) {
      dispatch({ type: 'SET_TASKS', payload: tasks });
    }
  }, [tasks]);

  if (loadingTasks) {
    return <LoadingProject />;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active, over });
    if (!over) return;

    const status = taskStatuses.find((status) => status.name === over.id);
    if (!status) return;

    // Optimistic UI update
    dispatch({
      type: 'UPDATE_TASK_STATUS',
      payload: {
        taskId: active.id as string,
        status: status.name as TaskStatus
      }
    });

    // Send mutation
    updateTaskStatus.mutate({
      id: active.id as string,
      status: status.name as TaskStatus
    });
  };


  return (
    <>
      <KanbanProvider
        onDragEnd={handleDragEnd}
        className="py-4"
        sensors={sensors}
      >
      {taskStatuses.map((status) => (
        <div className='min-h-[60vh] flex flex-col' key={status.name}>
          <KanbanHeader name={status.name} color={status.color} />
          <KanbanBoard key={status.name} id={status.name}>
          <KanbanCards>
            {state.filteredTasks[status.name]?.map((task, index) => (
              <TaskRow key={task.id} task={task} index={index} onClick={handleTaskCardClick} />
            ))}
          </KanbanCards>
        </KanbanBoard>
        </div>
      ))}
    </KanbanProvider>
      {editingTask && (
        <TaskSheet
          isOpen={isTaskSheetOpen}
          onOpenChange={(open) => !open && handleTaskSheetClose()}
          initialTaskData={editingTask}
          members={members}
          project={project}
          session={session}
        />
      )}
    </>
  );
});

export default BoardView;
