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
import { useNavigate } from "react-router-dom";
import { Share2, ArrowRight, Loader2, ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/organisms/Sidebar";
import { TopBar } from "@/components/organisms/TopBar";
import { Button } from "@/components/atoms/Button";
import { SuccessModal } from "@/components/atoms/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { networkService } from "@/services/networkService";

const CreateNetwork = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await networkService.createNetwork(
        name.trim(),
        description.trim()
      );

      if (response.status === 201) {
        setSuccessOpen(true);
      } else {
        setErrorOpen(true);
      }
    } catch (err) {
      console.error(err);
      setErrorOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate("/dashboard/network");
  };

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex overflow-x-hidden">
      {/* Side Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <TopBar title="Dashboard" />

        {/* Content */}
        <div className="flex-1 flex flex-col gap-6 px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-body">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/network")}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Networks
            </Button>
            <ChevronRight className="w-4 h-4 text-on-surface-variant" />
            <span className="text-primary font-semibold">Register Network</span>
          </div>

          {/* Page Header */}
          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="font-headline text-3xl font-black text-on-surface tracking-tighter">
              Register New Network
            </h1>
            <p className="text-on-surface-variant font-body text-sm leading-relaxed">
              Establish a new computational framework for genetic mapping.
              Define parameters for precision lab monitoring and data ingestion sequences.
            </p>
          </div>

          {/* Glass Card */}
          <div className="flex justify-center">
            <div
              className="bg-surface-bright/70 backdrop-blur-[20px] rounded-[2rem] p-8 md:p-12 w-full max-w-lg border border-outline-variant/15"
              style={{ boxShadow: "0 24px 48px -4px rgba(13, 28, 46, 0.06)" }}
            >
              <form onSubmit={handleCreate} className="flex flex-col gap-8">
                {/* Network Name Field */}
                <div className="flex flex-col gap-3">
                  <label className="font-headline text-[11px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
                    Nombre del network
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Alpha-Helix Distribution"
                      disabled={isSubmitting}
                      className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant/70 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200"
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant/80">
                    Assign a unique identifier for clinical tracking.
                  </p>
                </div>

                {/* Description Field */}
                <div className="flex flex-col gap-3">
                  <label className="font-headline text-[11px] font-bold tracking-[0.15em] uppercase text-on-surface-variant">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detail the scope, methodology, and expected data volume for this specific network instance..."
                    disabled={isSubmitting}
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 h-32 resize-none text-on-surface placeholder:text-outline-variant/70 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200"
                  />
                  <p className="text-[11px] text-on-surface-variant/80">
                    Detailed documentation supports reproducibility in later experiments.
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="text-xs font-semibold text-error bg-error-container/30 px-4 py-2.5 rounded-lg border border-error/10">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-6 mt-2">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => navigate("/dashboard/network")}
                    disabled={isSubmitting}
                    className="text-on-surface hover:text-primary font-semibold py-3 text-[15px]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2 py-3 font-bold hover:shadow-primary-glow transition-all transform hover:-translate-y-0.5 flex items-center justify-center min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <span>Crear Red</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <SuccessModal
        open={successOpen}
        title="Creación de red exitosa"
        message="La red fue creada correctamente."
        onClose={handleSuccessClose}
      />

      <ErrorModal
        open={errorOpen}
        title="Error"
        message="No pudo crearse la red"
        onClose={handleErrorClose}
      />
    </div>
  );
};

export default CreateNetwork;
