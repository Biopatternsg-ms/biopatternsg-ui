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
import * as React from "react";
import { cn } from "@/lib/utils";

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, active = false, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "font-body tracking-tight font-medium text-sm transition-all duration-300",
        active
          ? "text-primary border-b-2 border-primary pb-1"
          : "text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
      ,
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
);
NavLink.displayName = "NavLink";

export { NavLink };
