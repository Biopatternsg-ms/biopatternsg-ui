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

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useId,
  useCallback,
} from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GraphNodeInput } from "@/components/organisms/forceGraph/forceGraphTypes";
import { colorForType } from "@/components/organisms/forceGraph/forceGraphTypes";

/* ─────────────────────────────────────────────────────────────────────────────
   PROPS
   ───────────────────────────────────────────────────────────────────────────── */

export interface NodeSearchSelectProps {
  /** Node definitions to pick from. */
  nodes: GraphNodeInput[];
  /** Selected node name (`null` = none). */
  value: string | null;
  /** Callback fired when a node is selected or cleared. */
  onChange: (name: string | null) => void;
  /** Placeholder for search input. Default: "Buscar nodo...". */
  placeholder?: string;
  /** Extra class names for outer container. */
  className?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */

/**
 * NodeSearchSelect — Molecule
 *
 * Accessible searchable combobox to select or filter graph nodes by name and biological type.
 */
const NodeSearchSelect: React.FC<NodeSearchSelectProps> = ({
  nodes,
  value,
  onChange,
  placeholder = "Buscar nodo...",
  className,
}) => {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedQuery, setTypedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  // Sync internal state when controlled value changes from outside
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setIsTyping(false);
    setTypedQuery("");
  }

  // Deduplicate nodes by name and sort alphabetically
  const uniqueNodes = useMemo(() => {
    const map = new Map<string, GraphNodeInput>();
    for (const node of nodes) {
      if (!map.has(node.name)) {
        map.set(node.name, node);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [nodes]);

  // Filter nodes based on active typed query or show all when not typing
  const filteredNodes = useMemo(() => {
    const query = (isTyping ? typedQuery : "").trim().toLowerCase();
    if (!query) return uniqueNodes;
    return uniqueNodes.filter(
      (n) =>
        n.name.toLowerCase().includes(query) ||
        n.type.toLowerCase().includes(query)
    );
  }, [uniqueNodes, isTyping, typedQuery]);

  // Derived display value for the text input
  const displayValue = isTyping ? typedQuery : (value ?? "");

  const handleSelect = useCallback(
    (name: string) => {
      onChange(name);
      setIsTyping(false);
      setTypedQuery("");
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setIsTyping(false);
      setTypedQuery("");
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    setTypedQuery(e.target.value);
    setIsOpen(true);
    setActiveIndex(0);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsOpen(true);
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(filteredNodes.length > 0 ? 0 : -1);
      } else if (filteredNodes.length > 0) {
        setActiveIndex((prev) => (prev < filteredNodes.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(filteredNodes.length > 0 ? filteredNodes.length - 1 : -1);
      } else if (filteredNodes.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredNodes.length - 1));
      }
    } else if (e.key === "Enter") {
      if (isOpen && activeIndex >= 0 && activeIndex < filteredNodes.length) {
        e.preventDefault();
        handleSelect(filteredNodes[activeIndex].name);
      }
    } else if (e.key === "Escape") {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setIsTyping(false);
        setActiveIndex(-1);
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsTyping(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll active item into view during keyboard navigation
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex] as
        | HTMLElement
        | undefined;
      activeElement?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none opacity-70"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && activeIndex >= 0 && filteredNodes[activeIndex]
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full bg-surface-container-high border-none rounded-lg pl-9 pr-9 py-2",
            "text-on-surface placeholder:text-outline/50 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest",
            "transition-all duration-200"
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            aria-label="Limpiar selección"
          >
            <X className="w-3.5 h-3.5 opacity-70" />
          </button>
        )}
      </div>

      {isOpen && (
        <ul
          id={listboxId}
          ref={listRef}
          role="listbox"
          aria-label="Nodos"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-72 overflow-y-auto bg-surface-card border border-outline-variant/20 rounded-xl shadow-lg p-1.5 focus:outline-none custom-scrollbar"
        >
          {filteredNodes.length > 0 ? (
            filteredNodes.map((node, index) => {
              const isSelected = node.name === value;
              const isActive = index === activeIndex;

              return (
                <li
                  key={node.name}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(node.name)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                    isActive
                      ? "bg-surface-container-high text-on-surface"
                      : isSelected
                      ? "bg-primary-container/20 text-primary font-medium"
                      : "text-on-surface hover:bg-surface-container-high/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorForType(node.type) }}
                      aria-hidden="true"
                    />
                    <span className="truncate font-medium">{node.name}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant flex-shrink-0 font-normal">
                    {node.type}
                  </span>
                </li>
              );
            })
          ) : (
            <li
              className="px-3 py-4 text-sm text-on-surface-variant text-center"
              role="presentation"
            >
              Sin resultados
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

NodeSearchSelect.displayName = "NodeSearchSelect";

export { NodeSearchSelect };
