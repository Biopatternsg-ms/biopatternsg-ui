/*
 * Copyright © 2026 biopatternsg (biopatternsg@gmail.com)
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Avatar } from "@/components/atoms/Avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/atoms/DropdownMenu";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserProfileDisplay {
  name?: string;
  email?: string;
  initials?: string;
  avatarUrl?: string;
}

export interface UserMenuProps {
  user?: UserProfileDisplay | null;
  onLogout?: () => void;
  className?: string;
}

const UserMenu = ({ user, onLogout, className }: UserMenuProps) => {
  const displayName = user?.name || user?.email || "User";

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* User display name (desktop) */}
      <div className="hidden md:flex flex-col items-end justify-center">
        <span className="font-headline font-bold text-sm text-on-surface">
          {displayName}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2 transition-all cursor-pointer">
            <Avatar />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[200px]">
          {/* Mobile user name */}
          <div className="md:hidden">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </div>

          <DropdownMenuItem
            onClick={onLogout}
            className="text-error hover:bg-error/10 focus:bg-error/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export { UserMenu };
