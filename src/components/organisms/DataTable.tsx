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
  isAction?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
  totalCount?: number;
  pageIndex?: number;
  onPageChange?: (page: number) => void;
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = "No data available.",
  keyExtractor,
  totalCount,
  pageIndex,
  onPageChange,
  renderMobileCard,
  className,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);

  const isServerSide = totalCount !== undefined && pageIndex !== undefined && onPageChange !== undefined;

  const currentPage = isServerSide ? pageIndex + 1 : internalPage;
  const actualTotalCount = isServerSide ? totalCount : data.length;

  const totalPages = Math.max(1, Math.ceil(actualTotalCount / ROWS_PER_PAGE));
  const paginatedData = isServerSide
    ? data
    : data.slice(
      (currentPage - 1) * ROWS_PER_PAGE,
      currentPage * ROWS_PER_PAGE
    );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      if (isServerSide) {
        onPageChange(page - 1);
      } else {
        setInternalPage(page);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12 text-on-surface-variant font-body">
        Loading...
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
    <div className={cn("flex flex-col mt-6 md:mt-8", className)}>
      {paginatedData.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-10 text-center text-on-surface-variant font-body shadow-ambient">
          {emptyMessage}
        </div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="flex flex-col gap-4 md:hidden">
            {paginatedData.map((item, index) => {
              const globalIndex = (currentPage - 1) * ROWS_PER_PAGE + index;
              if (renderMobileCard) {
                return <div key={keyExtractor(item)}>{renderMobileCard(item, globalIndex)}</div>;
              }

              const isActionCol = (col: ColumnDef<T>) =>
                col.isAction ||
                !col.header ||
                ["options", "opciones", "actions", "acciones"].includes(col.header.toLowerCase().trim());

              const actionCols = columns.filter(isActionCol);
              const dataCols = columns.filter((col) => !isActionCol(col));

              return (
                <div
                  key={keyExtractor(item)}
                  className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient flex flex-col gap-3.5 border border-outline-variant/10"
                >
                  {/* Data Fields */}
                  <div className="flex flex-col gap-2 min-w-0">
                    {dataCols.map((col, colIdx) => {
                      const val = col.render
                        ? col.render(item, globalIndex)
                        : col.accessor
                          ? String(item[col.accessor] ?? "")
                          : null;

                      const isLongText = typeof val === "string" && val.length > 25;

                      if (isLongText) {
                        return (
                          <div
                            key={colIdx}
                            className="flex flex-col gap-1 text-sm py-2 border-b border-outline-variant/10 last:border-0 w-full min-w-0"
                          >
                            <span className="font-headline text-[12px] font-bold tracking-wider uppercase text-on-surface-variant/80">
                              {col.header}
                            </span>
                            <div className="font-body text-on-surface text-left font-medium min-w-0 w-full break-words leading-relaxed pt-0.5">
                              {val}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={colIdx}
                          className="flex justify-between items-center text-sm py-1.5 border-b border-outline-variant/10 last:border-0 gap-4 min-w-0"
                        >
                          <span className="font-headline text-[12px] font-bold tracking-wider uppercase text-on-surface-variant/80 shrink-0">
                            {col.header}
                          </span>
                          <div className="font-body text-on-surface text-right font-medium min-w-0 flex-1 break-words flex justify-end">
                            {val}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions Footer */}
                  {actionCols.length > 0 && (
                    <div className="pt-3 mt-1 border-t border-outline-variant/15 flex items-center justify-between gap-3">
                      <span className="font-headline text-[11px] font-bold tracking-wider uppercase text-on-surface-variant/70">
                        {actionCols[0]?.header || "Options"}
                      </span>
                      <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/15 shadow-sm">
                        {actionCols.map((col, colIdx) => (
                          <div key={colIdx} className="flex items-center gap-1">
                            {col.render
                              ? col.render(item, globalIndex)
                              : col.accessor
                                ? String(item[col.accessor] ?? "")
                                : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:flex md:flex-col md:gap-2">
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
              <div className="flex flex-col">
                {paginatedData.map((item, index) => {
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
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      {(isServerSide ? actualTotalCount > 0 : data.length > 0) && (
        <div className="flex items-center justify-between px-2 mt-6">
          <span className="font-body text-sm text-on-surface-variant">
            Showing {paginatedData.length} of {actualTotalCount} items
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
