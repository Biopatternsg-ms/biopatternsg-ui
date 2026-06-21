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
    title: "Revisión",
    description: "Confirmación final",
  },
];

const CreateExperiment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
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
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-on-surface">Parámetros del Modelo</h3>
            <p className="text-sm text-on-surface-variant">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Learning Rate"
                type="text"
                value="0.001"
                onChange={() => {}}
              />
              <FormField
                label="Batch Size"
                type="text"
                value="32"
                onChange={() => {}}
              />
              <FormField
                label="Epochs"
                type="text"
                value="100"
                onChange={() => {}}
              />
              <FormField
                label="Optimizer"
                type="text"
                value="Adam"
                onChange={() => {}}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-on-surface">Revisión y Confirmación</h3>
            <p className="text-sm text-on-surface-variant">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 space-y-3">
               <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                 <span className="text-sm text-on-surface-variant">Nombre</span>
                 <span className="text-sm font-bold text-on-surface">Lorem Ipsum Experiment</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-outline-variant/10">
                 <span className="text-sm text-on-surface-variant">Learning Rate</span>
                 <span className="text-sm font-bold text-on-surface">0.001</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-on-surface-variant">Batch Size</span>
                 <span className="text-sm font-bold text-on-surface">32</span>
               </div>
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
        message="Ocurrió un error al crear el experimento."
        onClose={() => setErrorModalOpen(false)}
      />
    </div>
  );
};

export default CreateExperiment;
