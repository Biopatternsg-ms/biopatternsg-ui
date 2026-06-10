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
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { networkService } from "@/services/networkService";
import type { Network } from "@/services/networkService";

const formatUnixTime = (unixSeconds: number) => {
  const date = new Date(unixSeconds * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear(); // 'a' = año
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  
  hours = hours % 12;
  hours = hours ? hours : 12; // el cero debe ser 12

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const NetworksTable = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const allSelected = selected.size === networks.length && networks.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(networks.map((n) => n.id)));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-on-surface-variant">
        Cargando redes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient border border-outline-variant/15">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container-low font-label text-[12px] tracking-widest uppercase text-on-surface-variant border-b border-outline-variant/15">
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="rounded border-outline-variant text-primary-container focus:ring-primary-container/20 bg-surface w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="col-span-4">Nombre</div>
        <div className="col-span-4">Description</div>
        <div className="col-span-2">Fecha de creación</div>
        <div className="col-span-1 text-right">Ver más</div>
      </div>

      {/* Table Body */}
      <div className="flex flex-col">
        {networks.length === 0 ? (
          <div className="p-6 text-center text-on-surface-variant font-body">
            No hay redes disponibles.
          </div>
        ) : (
          networks.map((network) => (
            <div
              key={network.id}
              className={cn(
                "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors border-b border-surface-container/50 font-body text-sm",
                "hover:bg-surface-container-high"
              )}
            >
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selected.has(network.id)}
                  onChange={() => toggleRow(network.id)}
                  className="rounded border-outline-variant text-primary-container focus:ring-primary-container/20 bg-surface w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="col-span-4 font-semibold text-on-surface">
                {network.name}
              </div>
              <div className="col-span-4 text-on-surface-variant">
                {network.description}
              </div>
              <div className="col-span-2 text-on-surface-variant">
                {formatUnixTime(network.createdAt)}
              </div>
              <div className="col-span-1 flex justify-end">
                <button className="text-outline hover:text-on-surface transition-colors p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export { NetworksTable };
