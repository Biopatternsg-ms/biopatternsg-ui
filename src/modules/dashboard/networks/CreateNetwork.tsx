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
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { DataForm } from "@/components/organisms/DataForm";
import * as z from "zod";
import { networkService } from "@/services/networkService";
import type { DataFormConfig } from "@/components/organisms/DataFormConfig";

const createNetworkSchema = z.object({
  name: z.string().min(1, "Network name is required."),
  description: z.string().min(1, "Description is required."),
});

const CreateNetwork = () => {
  const navigate = useNavigate();

  const networkConfig: DataFormConfig<{ name: string; description: string }> = {
    schema: createNetworkSchema,
    fields: [
      {
        name: "name",
        label: "Network Name",
        type: "text",
        placeholder: "e.g., Alpha-Helix Distribution",
        helperText: "Assign a unique identifier for clinical tracking.",
        colSpan: "full",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Detail the scope, methodology...",
        helperText: "Detailed documentation supports reproducibility.",
        colSpan: "full",
        rows: 3,
      },
    ],
    title: "Register New Network",
    subtitle: "Gene Regulatory Network Creation",
    submitLabel: "Create Network",
    submittingLabel: "Creating...",
    onSubmit: async (values) =>
      networkService.createNetwork(values.name.trim(), values.description.trim()),
    successStatus: 201,
    successModal: {
      title: "Network Created Successfully",
      message: "The network was created successfully.",
    },
    errorModal: {
      title: "Error",
      defaultMessage: "Could not create network.",
    },
    onSuccessClose: () => navigate("/dashboard/network"),
    footerLink: {
      text: "Want to return to your networks?",
      label: "Go to Networks",
      to: "/dashboard/network",
    },
  };

  return (
    <div >
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        className="mb-6"
        items={[
          { label: "Networks", href: "/dashboard/network" },
          { label: "Register Network" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-2 max-w-2xl mb-8">
        <h1 className="font-headline text-3xl font-black text-on-surface tracking-tighter">
          Register New Network
        </h1>
        <p className="text-on-surface-variant font-body text-sm leading-relaxed">
          Establish a new computational framework for genetic mapping.
          Define parameters for precision lab monitoring and data ingestion sequences.
        </p>
      </div>

      {/* Glass Card -> Replaced by DataForm */}
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <DataForm config={networkConfig} />
        </div>
      </div>
    </div>
  );
};

export default CreateNetwork;
