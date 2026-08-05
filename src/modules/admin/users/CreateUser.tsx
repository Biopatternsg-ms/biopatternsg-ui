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
import { useNavigate } from "react-router-dom";
import { DataForm } from "@/components/organisms/DataForm";
import * as z from "zod";
import { toCreateAdminUserPayload, type CreateAdminUserFormValues } from "@/adapters/userAdapter";
import { createAdminUser } from "@/services/userService";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name is too long."),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name is too long."),
});

const CreateUser = () => {
  const navigate = useNavigate();

  const createUserConfig: DataFormConfig<CreateAdminUserFormValues> = {
    schema: createUserSchema,
    fields: [
      {
        name: "email",
        label: "Email address",
        type: "email",
        placeholder: "name@institute.edu",
        colSpan: "full",
      },
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "Jane",
        colSpan: "half",
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Doe",
        colSpan: "half",
      },
    ],
    title: "Create New User",
    subtitle: "Add a researcher to the platform",
    submitLabel: "Create User",
    submittingLabel: "Creating...",
    onSubmit: async (values) => {
      const payload = toCreateAdminUserPayload(values);
      return createAdminUser(payload);
    },
    successStatus: 201,
    successModal: {
      title: "User Created!",
      message: "The user has been created successfully.",
    },
    errorModal: {
      title: "Could Not Create User",
      defaultMessage: "Server error. Please try again later.",
      parseResponseMessage: true,
    },
    onSuccessClose: () => {
      navigate("/dashboard/admin/users");
    },
  };

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* Scrollable container with padding */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          className="mb-6"
          items={[
            { label: "Users", href: "/dashboard/admin/users" },
            { label: "Create User" },
          ]}
        />

        {/* Centered Form similar to Register */}
        <div className="max-w-lg mx-auto">
          {/* Context Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Admin User Creation Session
            </span>
          </div>

          <DataForm config={createUserConfig} />
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
