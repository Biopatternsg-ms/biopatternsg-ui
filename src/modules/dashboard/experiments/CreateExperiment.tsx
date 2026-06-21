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
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Stepper, type Step } from "@/components/molecules/Stepper";
import { FormField } from "@/components/molecules/FormField";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";

const steps: Step[] = [
  {
    title: "Configuración General",
    description: "Información básica",
  },
  {
    title: "Parámetros del Modelo",
    description: "Hiperparámetros",
  },
  {
    title: "Define expert objects",
    description: "Search levels and export objects",
  },
];

const CreateExperiment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [sourceSelection, setSourceSelection] = useState<string>("JASPAR");
  const [searchLevel, setSearchLevel] = useState<string>("");
  const [exportObjectsFile, setExportObjectsFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (!exportObjectsFile) {
        setErrorMessage("Debe cargar un archivo CSV en el campo Export objects para crear el experimento.");
        setErrorModalOpen(true);
        return;
      }
      // Simulate submission
      setSuccessModalOpen(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate("/dashboard/experiments");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-on-surface">Configuración General</h3>
            <p className="text-sm text-on-surface-variant">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Nombre del Experimento"
                placeholder="e.g. Model Alpha v1.0"
                type="text"
                value="Lorem Ipsum Experiment"
                onChange={() => {}}
              />
              <FormField
                label="Descripción"
                placeholder="Describe the objective..."
                type="textarea"
                rows={3}
                value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
                onChange={() => {}}
              />
            </div>
          </div>
        );
      case 1: {
        const showJasparFields = sourceSelection === "JASPAR" || sourceSelection === "BOTH";
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-on-surface">Parámetros del Modelo</h3>
            <p className="text-sm text-on-surface-variant">Configura las fuentes genómicas y los parámetros de la región promotora.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Sources"
                type="select"
                containerClassName="col-span-1 sm:col-span-2"
                value={sourceSelection}
                onChange={(e) => setSourceSelection(e.target.value)}
                options={[
                  { value: "JASPAR", label: "JASPAR" },
                  { value: "TFBIND", label: "TFBIND" },
                  { value: "BOTH", label: "Ambos" }
                ]}
              />

              {showJasparFields && (
                <>
                  <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
                    <FormField label="Genome" type="text" defaultValue="HG38" />
                  </div>
                  <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
                    <FormField label="Track" type="text" defaultValue="jaspar2022" />
                  </div>
                  <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
                    <FormField label="Identity" type="text" defaultValue="100.0" />
                  </div>
                  <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
                    <FormField label="Chromosome" type="text" defaultValue="chr8" />
                  </div>
                  <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
                    <FormField label="Strand" type="text" defaultValue="NEGATIVE" />
                  </div>
                  <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
                    <FormField label="Start" type="text" defaultValue="58498163" />
                  </div>
                  <div className="animate-in fade-in zoom-in-95 duration-300 col-span-1">
                    <FormField label="End" type="text" defaultValue="58502163" />
                  </div>
                </>
              )}

              <div className="col-span-1 sm:col-span-2">
                <FormField label="Reliability" type="text" defaultValue="95" />
              </div>
              
              <div className="col-span-1 sm:col-span-2">
                <FormField
                  label="Promoter Region"
                  type="textarea"
                  rows={3}
                  placeholder="Ingrese la secuencia de la región promotora..."
                />
              </div>
            </div>
          </div>
        );
      }
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-on-surface">Define expert objects</h3>
            <p className="text-sm text-on-surface-variant">Configure the search level and upload the CSV file with the objects to export.</p>

            <div className="grid grid-cols-1 gap-6">
              <FormField
                label="Search Level"
                type="text"
                placeholder="e.g. 1, 2, 3"
                value={searchLevel}
                onChange={(e) => setSearchLevel(e.target.value)}
              />
              <FormField
                label="Export objects"
                type="file"
                accept=".csv"
                labelRight={
                  <Button variant="link" size="sm" asChild>
                    <a href="/templates/export-objects-template.csv" download>
                      Download template CSV
                    </a>
                  </Button>
                }
                onChange={(e) => {
                  const input = e.target as HTMLInputElement;
                  const file = input.files?.[0] ?? null;
                  if (file) {
                    const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
                    if (!isCsv) {
                      setExportObjectsFile(null);
                      setErrorMessage("Solo se permiten archivos de tipo CSV.");
                      setErrorModalOpen(true);
                      input.value = "";
                      return;
                    }
                  }
                  setExportObjectsFile(file);
                }}
              />
              {exportObjectsFile && (
                <p className="text-sm text-on-surface-variant">
                  Archivo seleccionado: <span className="font-medium text-on-surface">{exportObjectsFile.name}</span>
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm font-body mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/experiments")}
          className="text-on-surface-variant hover:text-primary gap-2"
        >
          Experiments
        </Button>
        <ChevronRight className="w-4 h-4 text-on-surface-variant" />
        <span className="text-primary font-semibold">Create Experiment</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-2 max-w-2xl mb-8">
        <h1 className="font-headline text-3xl font-black text-on-surface tracking-tighter">
          Register New Experiment
        </h1>
        <p className="text-on-surface-variant font-body text-sm leading-relaxed">
          Configure a new experimental pipeline. Set general properties, fine-tune model hyperparameters, and confirm your setup.
        </p>
      </div>

      {/* Glass Card Container */}
      <div className="flex justify-center">
        <div className="w-full max-w-3xl glass-panel p-8 rounded-2xl border border-outline-variant/15 shadow-xl relative overflow-hidden">
          {/* Decorative background blur orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {/* Stepper */}
            <div className="mb-12 mt-4 px-4 sm:px-8">
              <Stepper 
                steps={steps} 
                currentStep={currentStep} 
                onStepClick={setCurrentStep}
              />
            </div>

            {/* Step Content */}
            <div className="min-h-[250px]">
              {renderStepContent()}
            </div>

            {/* Footer Navigation */}
            <div className="mt-10 pt-6 border-t border-outline-variant/10 flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={currentStep === steps.length - 1 && !exportObjectsFile}
              >
                {currentStep === steps.length - 1 ? "Crear Experimento" : "Siguiente"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        title="Experimento creado"
        message="El experimento ha sido configurado y registrado exitosamente."
        onClose={handleSuccessClose}
      />

      <ErrorModal
        open={errorModalOpen}
        title="Error"
        message={errorMessage || "Ocurrió un error al crear el experimento."}
        onClose={() => setErrorModalOpen(false)}
      />
    </div>
  );
};

export default CreateExperiment;
