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
import { useState, useEffect } from "react";
import { FolderOpen, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { networkService } from "@/services/networkService";
import type { Network } from "@/services/networkService";

const ROWS_PER_PAGE = 3;

const formatUnixTime = (unixSeconds: number) => {
  const date = new Date(unixSeconds * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Returns a color class for the status dot based on row index.
 * Even rows → primary (blue), odd rows with index divisible by 3 → tertiary (orange).
 */
const getStatusColor = (index: number): string => {
  if (index % 3 === 2) return "bg-tertiary";
  return "bg-primary-container";
};

const NetworksTable = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        setLoading(true);
        const data = await networkService.getNetworks();
        setNetworks(data);
      } catch (err) {
        setError("Error al cargar las redes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworks();
  }, []);

  const totalPages = Math.max(1, Math.ceil(networks.length / ROWS_PER_PAGE));
  const paginatedNetworks = networks.slice(
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
        Cargando redes...
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
    <div className="flex flex-col gap-6">
      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-surface-container-low font-label text-[11px] tracking-widest uppercase text-on-surface-variant">
          <div className="col-span-3">Nombre</div>
          <div className="col-span-5">Descripción</div>
          <div className="col-span-2">Fecha de creación</div>
          <div className="col-span-2 text-right">Opciones</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {paginatedNetworks.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant font-body">
              No hay redes disponibles.
            </div>
          ) : (
            paginatedNetworks.map((network, index) => (
              <div
                key={network.id}
                className={cn(
                  "grid grid-cols-12 gap-4 px-8 py-5 items-center transition-all duration-300 font-body text-sm",
                  "hover:bg-surface-container-high"
                )}
              >
                {/* Name with status dot */}
                <div className="col-span-3 flex items-center gap-3">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      getStatusColor(index)
                    )}
                  />
                  <span className="font-semibold text-on-surface truncate">
                    {network.name}
                  </span>
                </div>

                {/* Description */}
                <div className="col-span-5 text-on-surface-variant truncate">
                  {network.description}
                </div>

                {/* Created date */}
                <div className="col-span-2 text-on-surface-variant">
                  {formatUnixTime(network.createdAt)}
                </div>

                {/* Action icons */}
                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    className="text-outline hover:text-primary transition-colors duration-300 p-1.5 rounded-lg hover:bg-surface-container-low"
                    title="Abrir"
                  >
                    <FolderOpen className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    className="text-outline hover:text-primary transition-colors duration-300 p-1.5 rounded-lg hover:bg-surface-container-low"
                    title="Editar"
                  >
                    <Pencil className="w-[18px] h-[18px]" />
                  </button>
                  <button
                    className="text-outline hover:text-error transition-colors duration-300 p-1.5 rounded-lg hover:bg-surface-container-low"
                    title="Eliminar"
                  >
                    <Trash2 className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {networks.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <span className="font-body text-sm text-on-surface-variant">
            Showing {paginatedNetworks.length} of {networks.length} networks
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
                    "w-8 h-8 rounded-lg font-body text-sm font-medium transition-all duration-300",
                    page === currentPage
                      ? "bg-primary-container text-on-primary font-bold shadow-sm"
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
};

export { NetworksTable };
