"use client";
import React from "react";
import Link from "next/link";
import { Session } from "auth";
import { Logo } from "../block/Logo";
import { ThemeSwitcher } from "../theme-switcher";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar({ session }: { session: Session }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/webhooks", label: "Webhooks" },
    { href: "/agents", label: "Agents" },
    { href: "/integrations", label: "Integrations" },
  ];

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
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={"ghost"}
              size="sm"
              className={cn(
                "h-8",
                pathname === item.href ? " text-primary" : "text-foreground",
              )}
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Right: User Profile Dropdown and Links */}
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <UserProfileDropdown session={session} />
      </div>
    </nav>
  );
}
