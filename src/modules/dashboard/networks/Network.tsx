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
import { useEffect, useState } from "react";
import { Network as NetworkIcon, Plus, FolderOpen, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { DataTable, type ColumnDef } from "@/components/organisms/DataTable";
import { networkService, type Network as NetworkModel } from "@/services/networkService";
import { cn } from "@/lib/utils";

const formatUnixTime = (unixSeconds: number) => {
  const date = new Date(unixSeconds * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getStatusColor = (index: number): string => {
  if (index % 3 === 2) return "bg-tertiary";
  return "bg-primary-container";
};

const Network = () => {
  const [networks, setNetworks] = useState<NetworkModel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        setLoading(true);
        const data = await networkService.getNetworks(page, size);
        setNetworks(data.list);
        setTotalCount(data.count);
      } catch (err) {
        setError("Error al cargar las redes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworks();
  }, [page, size]);

  const columns: ColumnDef<NetworkModel>[] = [
    {
      header: "Name",
      className: "col-span-3",
      render: (item, index) => (
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              getStatusColor(index)
            )}
          />
          <span className="font-semibold text-on-surface truncate">
            {item.name}
          </span>
        </div>
      ),
    },
    {
      header: "Description",
      className: "col-span-4 text-on-surface-variant truncate",
      accessor: "description",
    },
    {
      header: "Creation Date",
      className: "col-span-3 text-on-surface-variant whitespace-nowrap",
      render: (item) => formatUnixTime(item.createdAt),
    },
    {
      header: "Options",
      className: "col-span-2 text-right",
      render: (item) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="icon"
            size="icon"
            onClick={() => navigate(`/dashboard/experiments/${item.id}`)}
            title="Open"
          >
            <FolderOpen className="w-[18px] h-[18px]" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            title="Edit"
          >
            <Pencil className="w-[18px] h-[18px]" />
          </Button>
          <Button
            variant="iconDestructive"
            size="icon"
            title="Delete"
          >
            <Trash2 className="w-[18px] h-[18px]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header: Title, Description & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left: Icon + Title + Description */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <NetworkIcon className="text-primary-container w-7 h-7" />
            <h2 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
              Networks
            </h2>
          </div>
          <p className="text-on-surface-variant font-body text-sm max-w-lg leading-relaxed">
            Manage and integrate biological neural networks for clinical
            simulation and pattern analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/dashboard/network/create")}
            className="hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-[18px] h-[18px]" />
            Crear red
          </Button>
        </div>
      </div>

      {/* Networks Data Table */}
      <DataTable
        data={networks}
        totalCount={totalCount}
        pageIndex={page}
        onPageChange={setPage}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="No hay redes disponibles."
        keyExtractor={(item) => item.id}
      />
    </div>
  );
};

export default Network;
