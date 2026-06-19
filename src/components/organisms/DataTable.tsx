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
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ROWS_PER_PAGE = 10;

export interface ColumnDef<T> {
  header: string;
  accessor?: keyof T;
  className: string; // e.g. "col-span-3 text-right"
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = "No hay datos disponibles.",
  keyExtractor,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE));
  const paginatedData = data.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12 text-on-surface-variant font-body">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-12 text-error font-body">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Wrapper to control gap between header and table */}
      <div className="flex flex-col gap-2">
        {/* Table Header (Fuera de la tarjeta) */}
        <div className="grid grid-cols-12 gap-4 px-8 pb-2 pt-4 font-headline text-[13px] font-bold tracking-widest uppercase text-on-surface-variant">
          {columns.map((col, idx) => (
            <div key={idx} className={col.className}>
              {col.header}
            </div>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">

        {/* Table Body */}
        <div className="flex flex-col">
          {paginatedData.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant font-body">
              {emptyMessage}
            </div>
          ) : (
            paginatedData.map((item, index) => {
              // We need the global index to pass down to render if needed
              const globalIndex = (currentPage - 1) * ROWS_PER_PAGE + index;
              return (
                <div
                  key={keyExtractor(item)}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-8 py-6 items-center transition-all duration-300 font-body text-[15px]",
                    "hover:bg-surface-container-high"
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} className={col.className}>
                      {col.render
                        ? col.render(item, globalIndex)
                        : col.accessor
                        ? String(item[col.accessor] ?? "")
                        : null}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-2 mt-6">
          <span className="font-body text-sm text-on-surface-variant">
            Showing {paginatedData.length} of {data.length} items
          </span>

          <div className="flex items-center gap-1">
            {/* Previous */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                currentPage === 1
                  ? "text-outline-variant cursor-not-allowed"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-md font-body text-sm font-medium transition-all duration-300",
                    page === currentPage
                      ? "bg-primary text-white font-bold shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  )}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                currentPage === totalPages
                  ? "text-outline-variant cursor-not-allowed"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
