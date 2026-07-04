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
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Stepper, type Step } from "@/components/molecules/Stepper";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { StepGeneralConfig } from "./createExperiment/StepGeneralConfig";
import { StepModelParameters } from "./createExperiment/StepModelParameters";
import { StepExpertObjects } from "./createExperiment/StepExpertObjects";
import { experimentService } from "@/services/experimentService";
import { expertObjectsToCsvFile } from "@/utils/csvParser";
import type { Experiment, ExpertObject, TranscriptionFactorConfig } from "@/services/models/Experiment";

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
    description: "Search levels and expert objects",
  },
];

const CreateExperiment = () => {
  const navigate = useNavigate();
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const isEditMode = !!experimentId;
  const [currentStep, setCurrentStep] = useState(0);
  
  const [experimentName, setExperimentName] = useState("");
  const [experimentDescription, setExperimentDescription] = useState("");
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sourceSelection, setSourceSelection] = useState<string>("JASPAR");
  const [genome, setGenome] = useState("");
  const [track, setTrack] = useState("");
  const [identity, setIdentity] = useState("");
  const [chromosome, setChromosome] = useState("");
  const [strand, setStrand] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reliability, setReliability] = useState("");
  const [promoterRegion, setPromoterRegion] = useState("");

  const modelPlaceholders = {
    genome: "Ejm: HG38",
    track: "Ejm: jaspar2022",
    identity: "Ejm: 100.0",
    chromosome: "Ejm: chr8",
    strand: "Ejm: NEGATIVE",
    start: "Ejm: 58498163",
    end: "Ejm: 58502163",
    reliability: "Ejm: 95",
    promoterRegion: "Ingrese la secuencia de la región promotora...",
  };

  const [searchLevel, setSearchLevel] = useState<string>("");
  const [expertObjectsFile, setExpertObjectsFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  useEffect(() => {
    if (!experimentId) {
      return;
    }

    const fetchExperiment = async () => {
      setIsSubmitting(true);
      try {
        const data = await experimentService.getPipelineById(experimentId);
        setExperiment(data);
        setExperimentName(data.name);
        setExperimentDescription(data.description);

        const tfConfig = data.transcriptionFactorConfig;
        if (tfConfig) {
          const hasJaspar = tfConfig.sources.includes("JASPAR");
          const hasTfBind = tfConfig.sources.includes("TFBIND");
          setSourceSelection(hasJaspar && hasTfBind ? "BOTH" : hasJaspar ? "JASPAR" : "TFBIND");
          setGenome(tfConfig.genome ?? "");
          setTrack(tfConfig.track ?? "");
          setIdentity(tfConfig.identity?.toString() ?? "");
          setChromosome(tfConfig.chromosome ?? "");
          setStrand(tfConfig.strand ?? "");
          setStart(tfConfig.start ?? "");
          setEnd(tfConfig.end ?? "");
          setReliability(tfConfig.reliability?.toString() ?? "");
          setPromoterRegion(tfConfig.promoterRegion ?? "");
        }

        if (data.levels !== undefined) {
          setSearchLevel(data.levels.toString());
        }

        if (data.expertObjects && data.expertObjects.length > 0) {
          setExpertObjectsFile(expertObjectsToCsvFile(data.expertObjects));
        }
      } catch {
        setErrorMessage("Error al cargar la información del experimento.");
        setErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    };

    fetchExperiment();
  }, [experimentId]);

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!networkId) {
        setErrorMessage("Falta el ID de la red en la URL.");
        setErrorModalOpen(true);
        return;
      }
      if (!experimentName || !experimentDescription) {
        setErrorMessage("Por favor, ingrese el nombre y la descripción.");
        setErrorModalOpen(true);
        return;
      }

      setIsSubmitting(true);
      try {
        const response = experiment?.id
          ? await experimentService.updatePipelineDescription(experiment.id, experiment.name ?? "", experimentDescription)
          : await experimentService.createPipeline(networkId, experimentName, experimentDescription);

        if (response.ok) {
          const data: Experiment = await response.json();
          setExperiment(data);
          setExperimentDescription(data.description);
          setCurrentStep((prev) => prev + 1);
        } else {
          setErrorMessage(
            experiment?.id
              ? "Error al actualizar la descripción del experimento."
              : "Error al crear el experimento. Por favor, intente de nuevo."
          );
          setErrorModalOpen(true);
        }
      } catch {
        setErrorMessage("Ocurrió un error inesperado al comunicarse con el servidor.");
        setErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 1) {
      if (!experiment) {
        setErrorMessage("No se ha creado el experimento. Por favor, complete el paso anterior.");
        setErrorModalOpen(true);
        return;
      }

      const sources: string[] = [];
      if (sourceSelection === "JASPAR") sources.push("JASPAR");
      else if (sourceSelection === "TFBIND") sources.push("TFBIND");
      else if (sourceSelection === "BOTH") {
        sources.push("JASPAR");
        sources.push("TFBIND");
      }

      const tfConfig: TranscriptionFactorConfig = {
        sources,
        reliability: Number(reliability),
        promoterRegion,
        ...(sourceSelection !== "TFBIND" && {
          genome,
          track,
          identity: Number(identity),
          chromosome,
          strand,
          start,
          end,
        }),
      };

      setIsSubmitting(true);
      try {
        const response = await experimentService.updatePipeline(experiment.id, tfConfig);
        if (response.ok) {
          const updatedData: Experiment = await response.json();
          setExperiment(updatedData);
          setCurrentStep((prev) => prev + 1);
        } else {
          setErrorMessage("Error al guardar los factores de transcripción del experimento.");
          setErrorModalOpen(true);
        }
      } catch {
        setErrorMessage("Ocurrió un error inesperado al comunicarse con el servidor.");
        setErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (!experiment) {
        setErrorMessage("No se ha creado el experimento. Por favor, complete el paso anterior.");
        setErrorModalOpen(true);
        return;
      }
      if (!expertObjectsFile) {
        setErrorMessage("Debe cargar un archivo CSV en el campo Expert objects para crear el experimento.");
        setErrorModalOpen(true);
        return;
      }
      if (!searchLevel) {
        setErrorMessage("Por favor, ingrese el nivel de búsqueda.");
        setErrorModalOpen(true);
        return;
      }

      const levels = Number(searchLevel);
      if (Number.isNaN(levels)) {
        setErrorMessage("El nivel de búsqueda debe ser un número válido.");
        setErrorModalOpen(true);
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await experimentService.updateExperimentConfiguration(
          experiment.id,
          levels,
          experiment.expertObjects ?? []
        );
        if (response.ok) {
          setSuccessModalOpen(true);
        } else {
          setErrorMessage("Error al configurar el experimento. Por favor, intente de nuevo.");
          setErrorModalOpen(true);
        }
      } catch {
        setErrorMessage("Ocurrió un error inesperado al comunicarse con el servidor.");
        setErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate(networkId ? `/dashboard/experiments/${networkId}` : "/dashboard/network");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepGeneralConfig
            name={experiment?.id ? (experiment.name ?? "") : experimentName}
            description={experiment?.id ? (experiment.description ?? "") : experimentDescription}
            onNameChange={setExperimentName}
            onDescriptionChange={setExperimentDescription}
            nameReadOnly={!!experiment?.id}
          />
        );
      case 1:
        return (
          <StepModelParameters
            sourceSelection={sourceSelection}
            onSourceChange={setSourceSelection}
            genome={genome} onGenomeChange={setGenome}
            track={track} onTrackChange={setTrack}
            identity={identity} onIdentityChange={setIdentity}
            chromosome={chromosome} onChromosomeChange={setChromosome}
            strand={strand} onStrandChange={setStrand}
            start={start} onStartChange={setStart}
            end={end} onEndChange={setEnd}
            reliability={reliability} onReliabilityChange={setReliability}
            promoterRegion={promoterRegion} onPromoterRegionChange={setPromoterRegion}
            placeholders={modelPlaceholders}
          />
        );
      case 2:
        return (
          <StepExpertObjects
            searchLevel={searchLevel}
            onSearchLevelChange={setSearchLevel}
            expertObjectsFile={expertObjectsFile}
            onFileChange={setExpertObjectsFile}
            onFileParsed={(objects: ExpertObject[]) => {
              setExperiment((prev) => (prev ? { ...prev, expertObjects: objects } : prev));
            }}
            onError={(msg) => {
              setErrorMessage(msg);
              setErrorModalOpen(true);
            }}
            expertObjects={experiment?.expertObjects}
          />
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
          onClick={() => navigate(networkId ? `/dashboard/experiments/${networkId}` : "/dashboard/network")}
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
          {isEditMode ? "Edit Experiment" : "Register New Experiment"}
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
                onStepClick={(index) => {
                  if (index === 0) {
                    setCurrentStep(index);
                    return;
                  }

                  if (experiment?.id) {
                    setCurrentStep(index);
                  } else {
                    setErrorMessage("Es necesario cargar primero la información básica del experimento");
                    setErrorModalOpen(true);
                  }
                }}
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
                disabled={(currentStep === steps.length - 1 && !expertObjectsFile && !experiment?.expertObjects?.length) || isSubmitting}
                className="gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {currentStep === steps.length - 1 ? "Crear Experimento" : "Siguiente"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        title="Experimento creado"
        message="Configuración exitosa del experimento"
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
