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
import { Microscope, ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/organisms/DataTable";
import { Badge } from "@/components/atoms/Badge";
import { experimentService } from "@/services/experimentService";
import type { Experiment } from "@/services/models/Experiment";
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

  const [pipelines, setPipelines] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        setLoading(true);
        const data = await experimentService.getPipelines(networkId);
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

  const columns: ColumnDef<Experiment>[] = [
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
        <Badge variant={getStatusBadgeVariant(item.step ?? "")}>
          {item.step}
        </Badge>
      ),
    },
    {
      header: "Fecha de creación",
      className: "col-span-2 text-on-surface-variant whitespace-nowrap",
      render: (item) => formatUnixTime(item.createdAt ?? 0),
    },
    {
      header: "Opciones",
      className: "col-span-2 text-right",
      render: () => (
        <div className="flex justify-end gap-2">
          <Button
            variant="icon"
            size="icon"
            title="Editar"
          >
            <Pencil className="w-[18px] h-[18px]" />
          </Button>
          <Button
            variant="iconDestructive"
            size="icon"
            title="Eliminar"
          >
            <Trash2 className="w-[18px] h-[18px]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className={cn(!networkId && "hidden")}>
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

        {/* Right: Create experiment button */}
        {networkId && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/dashboard/experiments/${networkId}/create`)}
            className="hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-[18px] h-[18px]" />
            Crear experimento
          </Button>
        )}
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
  );
};

export default Experiments;
