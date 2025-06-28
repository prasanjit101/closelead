'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutBtn } from '@/components/block/SignOutBtn';
import { Session } from 'auth';
import { getInitials } from '@/lib/utils';

interface UserProfileDropdownProps {
    session: Session;
}

export function UserProfileDropdown({ session }: UserProfileDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                    <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name} />
                    <AvatarFallback className="text-lg text-secondary-foreground bg-secondary border">
                        {getInitials(session?.user?.name)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='px-3' align="end">
                <div className="py-2">
                    <div className="font-medium">{session?.user?.name}</div>
                    <div className="text-xs text-muted-foreground">{session?.user?.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <SignOutBtn />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
