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
import { Users as UsersIcon, Plus, Key, Power, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { DataTable, type ColumnDef } from "@/components/organisms/DataTable";
import { getAdminUsers, setAdminUserStatus, type UserModel } from "@/services/userService";
import { recoverPassword } from "@/services/authService";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
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
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
  const [successContent, setSuccessContent] = useState<{ title: string; message: string }>({ title: "", message: "" });
  const [errorContent, setErrorContent] = useState<{ title: string; message: string }>({ title: "", message: "" });

  // Basic pagination state (could be expanded to be controlled by DataTable)
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAdminUsers(page, size);
        setUsers(data.list);
        setTotalCount(data.count);
      } catch (err) {
        setError("Error loading users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, size]);

  const handleRecoveryPassword = async (username: string) => {
    try {
      const response = await recoverPassword({ username });
      if (response.ok) {
        setSuccessContent({
          title: "Check Your Inbox!",
          message: "We have sent you an email. Please check your inbox for instructions.",
        });
        setSuccessModalOpen(true);
      } else {
        setErrorContent({
          title: "Recovery Error",
          message: "An issue occurred while recovering your password.",
        });
        setErrorModalOpen(true);
      }
    } catch {
      setErrorContent({
        title: "Recovery Error",
        message: "An issue occurred while recovering your password.",
      });
      setErrorModalOpen(true);
    }
  };

  const handleToggleEnabled = async (id: string, currentState: boolean) => {
    const newState = !currentState;
    try {
      const response = await setAdminUserStatus(id, newState);
      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? { ...user, enabled: newState } : user))
        );
        setSuccessContent({
          title: newState ? "User enabled" : "User disabled",
          message: `User was ${newState ? "enabled" : "disabled"} successfully.`,
        });
        setSuccessModalOpen(true);
      } else {
        setErrorContent({
          title: "Status Error",
          message: "Could not change user status.",
        });
        setErrorModalOpen(true);
      }
    } catch {
      setErrorContent({
        title: "Status Error",
        message: "Could not change user status.",
      });
      setErrorModalOpen(true);
    }
  };

  const columns: ColumnDef<UserModel>[] = [
    {
      header: "Username",
      className: "col-span-2 text-on-surface truncate font-semibold",
      accessor: "username",
    },
    {
      header: "First Name",
      className: "col-span-2 text-on-surface-variant truncate",
      accessor: "firstName",
    },
    {
      header: "Last Name",
      className: "col-span-2 text-on-surface-variant truncate",
      accessor: "lastName",
    },
    {
      header: "Status",
      className: "col-span-2",
      render: (item) => {
        const isEnabled = item.enabled;
        return (
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                <CheckCircle2 className="w-4 h-4" />
                Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                <XCircle className="w-4 h-4" />
                Disabled
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Creation Date",
      className: "col-span-2 text-on-surface-variant whitespace-nowrap",
      render: (item) => formatUnixTime(item.createdTimestamp),
    },
    {
      header: "Options",
      className: "col-span-2 text-right",
      render: (item) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="icon"
            size="icon"
            onClick={() => handleRecoveryPassword(item.username)}
            title="Recover Password"
          >
            <Key className="w-[18px] h-[18px]" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            onClick={() => handleToggleEnabled(item.id, item.enabled)}
            title={item.enabled ? "Disable" : "Enable"}
          >
            <Power className={cn("w-[18px] h-[18px]", item.enabled ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600")} />
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
              Users
            </h2>
          </div>
          <p className="text-on-surface-variant font-body text-sm max-w-lg leading-relaxed">
            Manage platform users, administer access, and recover credentials.
          </p>
        </div>

        <div className="flex items-center justify-end w-full lg:w-auto gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/dashboard/admin/users/create")}
            className="hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-[18px] h-[18px]" />
            Create User
          </Button>
        </div>
      </div>

      {/* Users Data Table */}
      <DataTable
        data={users}
        totalCount={totalCount}
        pageIndex={page}
        onPageChange={setPage}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="No users available."
        keyExtractor={(item) => item.id}
      />

      <SuccessModal
        open={successModalOpen}
        title={successContent.title}
        message={successContent.message}
        onClose={() => setSuccessModalOpen(false)}
      />

      <ErrorModal
        open={errorModalOpen}
        title={errorContent.title}
        message={errorContent.message}
        onClose={() => setErrorModalOpen(false)}
      />
    </div>
  );
};

export default Users;
