"use client";
import React from "react";
import Link from "next/link";
import { Session } from "auth";
import { Logo } from "../block/Logo";
import { ThemeSwitcher } from "../theme-switcher";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { UserProfileDropdown } from "./UserProfileDropdown";

export function Navbar({ session }: { session: Session }) {
  const { mutate: updateUser } = trpc.user.updateUser.useMutation({
    onSuccess: () => toast.success("Project switched successfully"),
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Failed to switch project");
    },
  });

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-6 py-3 dark:bg-black">
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <Link href={"/"}>
          <Logo />
        </Link>
        <p className="text-sm">Welcome, {session?.user?.name}</p>
      </div>

      <div className="flex flex-grow items-center justify-center gap-4">
        {/* TODO: Add main controls here */}
      </div>

      {/* Right: User Profile Dropdown and Links */}
      <div className="flex items-center gap-8">
        <ThemeSwitcher />
        <UserProfileDropdown session={session} />
      </div>
    </nav>
  );
}
