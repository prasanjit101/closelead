'use client';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from 'sonner';
import { trpc } from '@/trpc/react';
import { TaskInsert, taskStatusArray } from '@/server/db/schema/task';
import { useTaskForm } from './task/use-tasks';
import { TaskSheetProps } from './task/task-props';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useDateFormatters } from '@/hooks/use-date';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"


const PRIORITY_OPTIONS = [
  { value: "Auto", label: "Auto" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];


function TaskFormFields({
  formData,
  setFormData,
}: {
  formData: TaskInsert;
  setFormData: React.Dispatch<React.SetStateAction<TaskInsert>>;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="details" className="text-right">
          Details
        </Label>
        <Textarea
          id="details"
          value={formData.details ?? ''}
          placeholder='Enter task details'
          rows={10}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, details: e.target.value }))
          }
          className="col-span-3"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="priority" className="text-right">
          Priority
        </Label>
        <Select
          defaultValue='Auto'
          value={formData.priority || ""}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              priority: value === "" ? undefined : (value as typeof formData.priority),
            }))
          }
        >
          <SelectTrigger id="priority" className="col-span-3">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select
          defaultValue='Planned'
          value={formData.status || ""}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              status: value === "" ? undefined : (value as typeof formData.status),
            }))
          }
        >
          <SelectTrigger id="priority" className="col-span-3">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {taskStatusArray.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4">
        <div className="space-y-1">
          <Label htmlFor="startAt" className="text-right">
            Start Date
          </Label>
          <Input
            id="startAt"
            type="date"
            value={formData.startAt ? new Date(formData.startAt).toISOString().slice(0, 10) : ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                startAt: e.target.value ? new Date(e.target.value) : null,
              }))
            }
            className="col-span-3"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endAt" className="text-right">
            End Date
          </Label>
          <Input
            id="endAt"
            type="date"
            value={formData.endAt ? new Date(formData.endAt).toISOString().slice(0, 10) : ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                endAt: e.target.value ? new Date(e.target.value) : null,
              }))
            }
            className="col-span-3"
          />
        </div>
      </div>
      <div className='flex items-center gap-3'>
          <Checkbox
            id="useAi"
            checked={formData.useAi ?? false}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, useAi: checked == true }))
            }
          />
        <div>
          <Label htmlFor="useAi" className="text-sm text-wrap">
            Add as subtasks
          </Label>
          <p className='text-xs text-muted-foreground'>Entered details will be used to create subtasks. Rest of the inputs are inherited by all the subtasks.</p>
        </div>
      </div>
    </div>
  );
}

export const TaskSheet = ({
  isOpen,
  onOpenChange,
  initialTaskData,
  members,
  trigger,
  project,
  session,
}: TaskSheetProps) => {
  const utils = trpc.useUtils();
  const { shortDateFormatter, dateFormatter } = useDateFormatters();
  const { formData, setFormData, initialTaskFormData } = useTaskForm(
    initialTaskData,
    project,
    session
  );

  const onSettled = (msg: string) => {
    toast.success(msg);
    utils.task.listTasksByProject.invalidate({ projectId: project?.id! });
  }

  const createTask = trpc.task.createTask.useMutation({
    onSuccess: () => {
      onSettled('Task created successfully');
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const updateTaskDetails = trpc.task.updateTask.useMutation({
    onMutate: async (updatedTask) => {
      await utils.task.listTasksByProject.cancel({ projectId: project?.id! });
      const previousTasks = utils.task.listTasksByProject.getData({ projectId: project?.id! });

      utils.task.listTasksByProject.setData(
        { projectId: project?.id! },
        (old) => old?.map(task =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      );
      toast.success('Task updated successfully');
      return { previousTasks };
    },
    onError: (err, updatedTask, context) => {
      utils.task.listTasksByProject.setData(
        { projectId: project?.id! },
        context?.previousTasks
      );
      toast.error(err.message);
    },
    onSettled: () => onSettled('Task updated successfully'),
  });

  const deleteTask = trpc.task.deleteTask.useMutation({
    onSuccess: async (_, { id }) => {
      await utils.task.listTasksByProject.cancel({ projectId: project?.id! });
      const previousTasks = utils.task.listTasksByProject.getData({ projectId: project?.id! });
      utils.task.listTasksByProject.setData(
        { projectId: project?.id! },
        (old) => old?.filter(task => task.id !== id)
      );
      return { previousTasks };
    },
    onError: (err, updatedTask, context: any) => {
      utils.task.listTasksByProject.setData(
        { projectId: project?.id! },
        context?.previousTasks
      );
      toast.error(err.message);
    },
    onSettled: () => onSettled('Task deleted successfully'),
  });

  const handleTaskUpdate = () => {
    if (!initialTaskData) return;
    updateTaskDetails.mutate({
      id: initialTaskData.id,
      ...formData
    });
    onOpenChange(false);
    setFormData(initialTaskFormData);
  };

  const handleNewTask = () => {
    createTask.mutate(formData);
    setFormData(initialTaskFormData);
  };

  const isEditing = !!initialTaskData?.id;

  const handleDelete = () => {
    if (!isEditing) return;
    deleteTask.mutate({ id: initialTaskData.id });
    onOpenChange(false);
    setFormData(initialTaskFormData);
  };

  const isLoading = createTask.isPending || updateTaskDetails.isPending;


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-1/3 min-w-[500] max-w-screen-lg space-y-8 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </SheetTitle>
          <SheetDescription>{isEditing && initialTaskData?.title}</SheetDescription>
        </SheetHeader>
        <TaskFormFields formData={formData} setFormData={setFormData} />
        <SheetFooter className='flex justify-between py-8'>
          {isEditing && (
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          <Button
            type="submit"
            onClick={initialTaskData?.id ? handleTaskUpdate : handleNewTask}
            disabled={isLoading}
          >
            {initialTaskData?.id ? 'Update Task' : 'Create Task'}
          </Button>
        </SheetFooter>
        {
          isEditing && (
            <>
              <Separator />
              <div className="w-full">
                <div className="rounded-md">
                  <Table className="w-full text-sm">
                    <TableBody>
                      {initialTaskData?.createdBy && (
                        <TableRow className='border-0'>
                          <TableCell className="py-2 px-4 font-medium">Task created by</TableCell>
                          <TableCell className="py-2 px-4 flex items-center gap-2">
                            <img
                              src={initialTaskData?.createdBy?.image}
                              alt="Avatar"
                              className="h-4 w-4 rounded-lg"
                            />
                            <span>{initialTaskData?.createdBy?.name}</span>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className='border-0'>
                        <TableCell className="py-2 px-4 font-medium">Created At</TableCell>
                        <TableCell className="py-2 px-4 text-muted-foreground">
                          {initialTaskData?.createdAt
                            ? dateFormatter.format(new Date(initialTaskData.createdAt)) +
                            " " +
                            new Date(initialTaskData.createdAt).toLocaleTimeString()
                            : ""}
                        </TableCell>
                      </TableRow>
                      <TableRow className='border-0'>
                        <TableCell className="py-2 px-4 font-medium">Updated At</TableCell>
                        <TableCell className="py-2 px-4 text-muted-foreground">
                          {initialTaskData?.updatedAt
                            ? dateFormatter.format(new Date(initialTaskData.updatedAt)) +
                            " " +
                            new Date(initialTaskData.updatedAt).toLocaleTimeString()
                            : ""}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )
        }
      </SheetContent>
    </Sheet>
  );
};
