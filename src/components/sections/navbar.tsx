"use client";
import React from "react";
import Link from "next/link";
import { Session } from "auth";
import { Logo } from "../block/Logo";
import { ThemeSwitcher } from "../theme-switcher";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function Navbar({ session }: { session: Session }) {
  console.log({ session });
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-20 py-3 dark:bg-black">
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
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <UserProfileDropdown session={session} />
      </div>
    </nav>
  );
}
