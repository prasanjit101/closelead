'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Session } from 'auth';
import { Logo } from '../block/Logo';
import { ThemeSwitcher } from '../theme-switcher';
import { trpc } from '@/trpc/react';
import { Project } from '@/server/db/schema';
import { toast } from 'sonner';
import { ProjectSwitcher } from './ProjectSwitcher';
import { UserProfileDropdown } from './UserProfileDropdown';

export function Navbar({ session }: { session: Session }) {
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const { mutate: updateUser } = trpc.user.updateUser.useMutation({
    onSuccess: () => toast.success("Project switched successfully"),
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Failed to switch project");
    },
  });

  const selectProject = (project: Project, mutate = true) => {
    setSelectedProject(project);
    if (mutate) {
      updateUser({ currProjectId: project.id });
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-white dark:bg-black sticky top-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <Link href={'/'}>
          <Logo />
        </Link>
        <p className="text-sm">Welcome, {session?.user?.name}</p>
      </div>

      {/* Center: Main Controls */}
      <div className="flex items-center gap-4 flex-grow justify-center">
        <ProjectSwitcher
          selectedProject={selectedProject}
          onProjectSelect={selectProject}
          user={session.user}
        />
      </div>

      {/* Right: User Profile Dropdown and Links */}
      <div className='flex items-center gap-8'>
        <ThemeSwitcher />
        <UserProfileDropdown session={session} />
      </div>
    </nav>
  );
}
