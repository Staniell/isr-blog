"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthModal from "./AuthModal";
import CreatePostModal from "./CreatePostModal";

interface SessionProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
}

export default function NavbarActions({ session }: SessionProps) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        {/* Create Post Button (Opens Modal) */}
        <CreatePostModal />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-9 w-9 border border-white/10 hover:border-white/20 transition-colors">
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-(--bg-primary) border-(--bg-secondary) text-(--text-primary) min-w-[200px]"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-(--text-primary)">{session.user.name}</p>
                <p className="text-xs leading-none text-(--text-secondary)">{session.user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-(--bg-secondary)" />
            <DropdownMenuItem asChild className="focus:bg-(--bg-secondary) focus:text-(--text-primary) cursor-pointer">
              <Link href="/blog" className="flex items-center w-full">
                My Posts
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut()}
              className="focus:bg-(--bg-secondary) focus:text-(--text-primary) cursor-pointer text-red-500 focus:text-red-500"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <AuthModal defaultTab="login" />
      <AuthModal defaultTab="signup" />
    </div>
  );
}
