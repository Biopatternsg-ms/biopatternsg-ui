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
import { useParams, useNavigate } from "react-router-dom";
import { Microscope, ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Sidebar } from "@/components/organisms/Sidebar";
import { TopBar } from "@/components/organisms/TopBar";
import { DataTable, type ColumnDef } from "@/components/organisms/DataTable";
import { Badge } from "@/components/atoms/Badge";
import { pipelineService, type Pipeline } from "@/services/pipelineService";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const formatUnixTime = (unixSeconds: number) => {
  const date = new Date(unixSeconds * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Map step values to our Badge variants
const getStatusBadgeVariant = (step: string): "new" | "inProgress" | "completed" | "neutral" => {
  switch (step) {
    case "CONFIG":
      return "new";
    case "TRAINING":
      return "inProgress";
    case "COMPLETED":
      return "completed";
    default:
      return "neutral";
  }
};

const Experiments = () => {
  const { networkId } = useParams<{ networkId: string }>();
  const navigate = useNavigate();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        setLoading(true);
        const data = await pipelineService.getPipelines(networkId);
        setPipelines(data);
      } catch (err) {
        setError("Error al cargar los experimentos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelines();
  }, [networkId]);

  const columns: ColumnDef<Pipeline>[] = [
    {
      header: "Nombre",
      className: "col-span-3 font-semibold text-on-surface truncate",
      accessor: "name",
    },
    {
      header: "Descripción",
      className: "col-span-3 text-on-surface-variant truncate",
      accessor: "description",
    },
    {
      header: "Status",
      className: "col-span-2",
      render: (item) => (
        <Badge variant={getStatusBadgeVariant(item.step)}>
          {item.step}
        </Badge>
      ),
    },
    {
      header: "Fecha de creación",
      className: "col-span-2 text-on-surface-variant whitespace-nowrap",
      render: (item) => formatUnixTime(item.createdAt),
    },
    {
      header: "Opciones",
      className: "col-span-2 text-right",
      render: () => (
        <div className="flex justify-end gap-2">
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
      ),
    },
  ];

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex overflow-x-hidden">
      {/* Side Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar title="Dashboard" />

        {/* Page Canvas */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-10">
          
          {/* Back button */}
          <div className={cn(!networkId && "invisible")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/network")}
              className="text-on-surface-variant hover:text-primary gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Redes
            </Button>
          </div>

          {/* Page Header: Title, Description & Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Left: Icon + Title + Description */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Microscope className="text-primary-container w-7 h-7" />
                <h2 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
                  Experimentos
                </h2>
              </div>
              <p className="text-on-surface-variant font-body text-sm max-w-lg leading-relaxed">
                Visualiza los pipelines y simulaciones en ejecución o completados para la red seleccionada.
              </p>
            </div>
          </div>

          {/* Pipelines Data Table */}
          <DataTable
            data={pipelines}
            columns={columns}
            loading={loading}
            error={error}
            emptyMessage="No hay experimentos disponibles para esta red."
            keyExtractor={(item) => item.id}
          />
        </div>
      </main>
    </div>
  );
};

export default Experiments;
