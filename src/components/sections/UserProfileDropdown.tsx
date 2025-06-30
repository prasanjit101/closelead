"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutBtn } from "@/components/block/SignOutBtn";
import { Session } from "auth";
import { getInitials } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface UserProfileDropdownProps {
  session: Session;
}

export function UserProfileDropdown({ session }: UserProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2">
          <Avatar className="cursor-pointer">
            <AvatarImage
              src={session?.user?.image ?? ""}
              alt={session?.user?.name}
            />
            <AvatarFallback className="border bg-secondary text-lg text-secondary-foreground">
              {getInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <ChevronDown
            className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="px-3" align="end">
        <div className="py-2">
          <div className="font-medium">{session?.user?.name}</div>
          <div className="text-xs text-muted-foreground">
            {session?.user?.email}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SignOutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
