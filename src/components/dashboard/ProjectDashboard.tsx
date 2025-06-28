import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '../ui/button';
import { SettingsViewProps } from '@/types/dashboard.types';
import { ProjectMemberRoles } from '@/server/db/schema';
import { SettingsView } from '@/components/dashboard/Settingsview';
import BoardView from './Boardview';
import { TaskSheet } from '@/components/dashboard/TaskSheet';
import { Logo } from '../block/Logo';
import { trpc } from '@/trpc/react';

export const ProjectDashboard = ({
  project,
  members,
  session,
  tasks
}: SettingsViewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: customField } = trpc.customField.getTemplatesByProject.useQuery({
    projectId: project?.id!,
    type: 'custom_field'
  }, {
    enabled: !!project?.id,
    refetchOnWindowFocus: false
  });

  const currentUserRole = (members.find(member => member.id === session?.user.id)?.role!) as ProjectMemberRoles;

  if (!project) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center h-[60vh]">
        <Logo />
        <p className="text-md">{session?.user?.currProjectId && 'Loading your project...'}</p>
      </div>
    );
  }
  return (
    <Tabs defaultValue="board" className="w-full">
      <div className="w-full flex justify-between items-center border-b">
        <TabsList>
          <TabsTrigger value="board">Task Board</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <div className='flex items-center gap-2'>
          {/* new task button */}
          <TaskSheet
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            members={members}
            project={project}
            session={session}
            trigger={<Button size="sm">New Task</Button>}
          />
        </div>
      </div>
      <TabsContent value="board">
        <BoardView tasks={tasks} currentUserRole={currentUserRole} project={project} members={members} session={session} />
      </TabsContent>
      <TabsContent value="settings" className="space-y-6 p-4">
        <SettingsView tasks={tasks} currentUserRole={currentUserRole} project={project} members={members} session={session} />
      </TabsContent>
    </Tabs>
  );
};
