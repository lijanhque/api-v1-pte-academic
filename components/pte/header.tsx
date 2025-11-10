"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOutAction } from "@/lib/auth/actions";
import { User as UserType } from "@/lib/db/schema";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user, error } = useSWR<UserType>("/api/user", fetcher, {
    onError: (err) => {
      console.error("SWR Error:", err);
    },
    errorRetryCount: 0,
  });

  if (error || !user) {
    return (
      <Button asChild className="rounded-full">
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ""} />
          <AvatarFallback>
            {user.email
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <Link href="/pte/profile" className="w-full">
          <DropdownMenuItem className="w-full flex-1 cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <form action={signOutAction} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <X className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex-1" />
      <Suspense
        fallback={
          <div className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
        }
      >
        <UserMenu />
      </Suspense>
    </header>
  );
}
