"use client";
import { useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { trpc } from "@/trpc/react";
import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard";
import { LoadingProject } from "@/components/dashboard/LoadingComponent";
import { EmptyProject } from "@/components/empty-project";
import { useSession } from "@/lib/auth-client";


export default function Dashboard() {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const { data: session, isPending: isLoadingSession } = useSession();

  // Fetch project with members and tasks in one query
  const { data: projectData, isLoading: isProjectLoading, refetch } = trpc.project.getProjectWithDetails.useQuery(
    { id: selectedProject?.id },
    {
      enabled: !!selectedProject?.id,
      refetchOnWindowFocus: false,
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      staleTime: 60 * 1000, // 1 minute cache
    }
  );

  // Update selected project when data loads
  useEffect(() => {
    if (projectData?.project && !selectedProject) {
      setSelectedProject(projectData.project);
    }
  }, [projectData?.project, selectedProject, setSelectedProject]);

  // Refetch data when project changes
  useEffect(() => {
    if (selectedProject?.id) {
      refetch();
    }
  }, [selectedProject?.id, refetch]);

  const isLoading = isProjectLoading || isLoadingSession;

  if (isLoading) return <LoadingProject />;

  if (!projectData) return <EmptyProject />;

  return (
    <div className="min-h-screen py-20 space-y-10 w-10/12 mx-auto">
      <ProjectDashboard
        tasks={projectData.tasks}
        project={projectData.project}
        members={projectData.members}
        session={session}
      />
    </div>
  );
}
