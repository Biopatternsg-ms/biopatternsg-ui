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
import { Users as UsersIcon, Plus, Key, Pencil, Power, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { DataTable, type ColumnDef } from "@/components/organisms/DataTable";
import { getAdminUsers, type UserModel } from "@/services/userService";
import { cn } from "@/lib/utils";

const formatUnixTime = (unixSeconds: number) => {
  if (!unixSeconds) return "-";
  // Determine if it's in milliseconds or seconds (Keycloak often sends milliseconds)
  const isMilliseconds = unixSeconds > 1000000000000;
  const date = new Date(isMilliseconds ? unixSeconds : unixSeconds * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Users = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Basic pagination state (could be expanded to be controlled by DataTable)
  const [page] = useState(0);
  const [size] = useState(10);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAdminUsers(page, size);
        setUsers(data);
      } catch (err) {
        setError("Error al cargar los usuarios");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, size]);

  const handleRecoveryPassword = (username: string) => {
    console.log("Recuperar contraseña para:", username);
    // TODO: Connect with actual API
  };

  const handleEdit = (id: string) => {
    console.log("Editar usuario:", id);
    // TODO: navigate to edit page or open modal
  };

  const handleToggleEnabled = (id: string, currentState: boolean | string) => {
    console.log("Cambiar estado de usuario:", id, "Estado actual:", currentState);
    // TODO: Connect with actual API
  };

  const columns: ColumnDef<UserModel>[] = [
    {
      header: "Usuario",
      className: "col-span-2 text-on-surface truncate font-semibold",
      accessor: "username",
    },
    {
      header: "Nombre",
      className: "col-span-2 text-on-surface-variant truncate",
      accessor: "firstName",
    },
    {
      header: "Apellido",
      className: "col-span-2 text-on-surface-variant truncate",
      accessor: "lastName",
    },
    {
      header: "Estado",
      className: "col-span-2",
      render: (item) => {
        const isEnabled = item.enabled === true || item.enabled === "true";
        return (
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                <CheckCircle2 className="w-4 h-4" />
                Habilitado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                <XCircle className="w-4 h-4" />
                Deshabilitado
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Fecha de creación",
      className: "col-span-2 text-on-surface-variant whitespace-nowrap",
      render: (item) => formatUnixTime(item.createdTimestamp),
    },
    {
      header: "Opciones",
      className: "col-span-2 text-right",
      render: (item) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="icon"
            size="icon"
            onClick={() => handleRecoveryPassword(item.username)}
            title="Recuperar contraseña"
          >
            <Key className="w-[18px] h-[18px]" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            onClick={() => handleEdit(item.id)}
            title="Editar"
          >
            <Pencil className="w-[18px] h-[18px]" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            onClick={() => handleToggleEnabled(item.id, item.enabled)}
            title={item.enabled === true || item.enabled === "true" ? "Deshabilitar" : "Habilitar"}
          >
            <Power className={cn("w-[18px] h-[18px]", (item.enabled === true || item.enabled === "true") ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600")} />
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
            <UsersIcon className="text-primary-container w-7 h-7" />
            <h2 className="font-headline text-2xl font-black text-on-surface tracking-tighter">
              Usuarios
            </h2>
          </div>
          <p className="text-on-surface-variant font-body text-sm max-w-lg leading-relaxed">
            Gestione los usuarios de la plataforma, administre accesos y recupere credenciales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/dashboard/admin/users/create")}
            className="hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-[18px] h-[18px]" />
            Crear usuario
          </Button>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="mt-8">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          error={error}
          emptyMessage="No hay usuarios disponibles."
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
};

export default Users;
