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
import { Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/atoms/Breadcrumb";
import { Stepper, type Step } from "@/components/molecules/Stepper";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { StepGeneralConfig } from "./createExperiment/StepGeneralConfig";
import { StepModelParameters } from "./createExperiment/StepModelParameters";
import { StepExpertObjects } from "./createExperiment/StepExpertObjects";
import { StepSearchConfig } from "./createExperiment/StepSearchConfig";
import { experimentService } from "@/services/experimentService";
import { expertObjectsToCsvFile } from "@/utils/csvParser";
import type { Experiment, ExpertObject, TranscriptionFactorConfig } from "@/services/models/Experiment";

const steps: Step[] = [
  {
    title: "General Configuration",
    description: "Basic information",
  },
  {
    title: "Model Parameters",
    description: "Hyperparameters",
  },
  {
    title: "Expert Objects",
    description: "Search objects",
  },
  {
    title: "Search Configuration",
    description: "Levels & Pubtator",
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
    genome: "e.g.: HG38",
    track: "e.g.: jaspar2022",
    identity: "e.g.: 100.0",
    chromosome: "e.g.: chr8",
    strand: "e.g.: NEGATIVE",
    start: "e.g.: 58498163",
    end: "e.g.: 58502163",
    reliability: "e.g.: 95",
    promoterRegion: "Enter promoter region sequence...",
  };

  const [searchLevel, setSearchLevel] = useState<string>("");
  const [retMax, setRetMax] = useState<string>("");
  const [maxComplexes, setMaxComplexes] = useState<string>("");
  const [useOnlyPrincipalName, setUseOnlyPrincipalName] = useState(true);
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
        setExperimentName(data.name ?? "");
        setExperimentDescription(data.description ?? "");

        const tfConfig = data.transcriptionFactorConfig;
        if (tfConfig) {
          const hasJaspar = tfConfig.sources?.includes("JASPAR") ?? false;
          const hasTfBind = tfConfig.sources?.includes("TFBIND") ?? false;
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

        if (data.levels != null) {
          setSearchLevel(data.levels.toString());
        }

        if (data.retMax != null) {
          setRetMax(data.retMax.toString());
        }

        if (data.maxComplexes != null) {
          setMaxComplexes(data.maxComplexes.toString());
        }

        if (data.useOnlyPrincipalName !== undefined) {
          setUseOnlyPrincipalName(data.useOnlyPrincipalName);
        }

        if (data.expertObjects && data.expertObjects.length > 0) {
          setExpertObjectsFile(expertObjectsToCsvFile(data.expertObjects));
        }
      } catch {
        setErrorMessage("Error loading experiment information.");
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
        setErrorMessage("Network ID is missing in the URL.");
        setErrorModalOpen(true);
        return;
      }
      if (!experimentName || !experimentDescription) {
        setErrorMessage("Please enter a name and description.");
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
              ? "Error updating experiment description."
              : "Error creating experiment. Please try again."
          );
          setErrorModalOpen(true);
        }
      } catch {
        setErrorMessage("An unexpected error occurred while communicating with the server.");
        setErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 1) {
      if (!experiment) {
        setErrorMessage("Experiment has not been created. Please complete the previous step first.");
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
          setErrorMessage("Error saving experiment transcription factors.");
          setErrorModalOpen(true);
        }
      } catch {
        setErrorMessage("An unexpected error occurred while communicating with the server.");
        setErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 2) {
      if (!experiment) {
        setErrorMessage("Experiment has not been created. Please complete the previous step first.");
        setErrorModalOpen(true);
        return;
      }
      if (!expertObjectsFile) {
        setCurrentStep((prev) => prev + 1);
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await experimentService.updateExperimentConfiguration(
          experiment.id,
          experiment.expertObjects ?? []
        );
        if (response.ok) {
          const updatedData: Experiment = await response.json();
          setExperiment(updatedData);
          setCurrentStep((prev) => prev + 1);
        } else {
          setErrorMessage("Error saving experiment expert objects.");
          setErrorModalOpen(true);
        }
      } catch {
        setErrorMessage("An unexpected error occurred while communicating with the server.");
        setErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!experiment) {
        setErrorMessage("Experiment has not been created. Please complete the previous step first.");
        setErrorModalOpen(true);
        return;
      }
      if (!searchLevel) {
        setErrorMessage("Please enter the search level.");
        setErrorModalOpen(true);
        return;
      }
      if (!retMax) {
        setErrorMessage("Please enter maximum search limit for PubTator.");
        setErrorModalOpen(true);
        return;
      }
      if (!maxComplexes) {
        setErrorMessage("Please enter maximum complexes count.");
        setErrorModalOpen(true);
        return;
      }

      const levels = Number(searchLevel);
      if (Number.isNaN(levels)) {
        setErrorMessage("Search level must be a valid number.");
        setErrorModalOpen(true);
        return;
      }
      if (levels < 1 || levels > 3) {
        setErrorMessage("Search level must be between 1 and 3.");
        setErrorModalOpen(true);
        return;
      }

      const retMaxNumber = Number(retMax);
      if (Number.isNaN(retMaxNumber)) {
        setErrorMessage("Maximum search limit must be a valid number.");
        setErrorModalOpen(true);
        return;
      }

      const maxComplexesNumber = Number(maxComplexes);
      if (Number.isNaN(maxComplexesNumber)) {
        setErrorMessage("Maximum complexes count must be a valid number.");
        setErrorModalOpen(true);
        return;
      }
      if (maxComplexesNumber <= 0) {
        setErrorMessage("Maximum complexes count must be greater than zero.");
        setErrorModalOpen(true);
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await experimentService.updateSearchConfig(
          experiment.id,
          levels,
          retMaxNumber,
          useOnlyPrincipalName,
          maxComplexesNumber
        );
        if (response.ok) {
          setSuccessModalOpen(true);
        } else {
          setErrorMessage("Error configuring experiment search.");
          setErrorModalOpen(true);
        }
      } catch {
        setErrorMessage("An unexpected error occurred while communicating with the server.");
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
      case 3:
        return (
          <StepSearchConfig
            searchLevel={searchLevel}
            onSearchLevelChange={setSearchLevel}
            retMax={retMax}
            onRetMaxChange={setRetMax}
            useOnlyPrincipalName={useOnlyPrincipalName}
            onUseOnlyPrincipalNameChange={setUseOnlyPrincipalName}
            maxComplexes={maxComplexes}
            onMaxComplexesChange={setMaxComplexes}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        className="mb-6"
        items={[
          {
            label: "Experiments",
            href: networkId ? `/dashboard/experiments/${networkId}` : "/dashboard/network",
          },
          { label: isEditMode ? "Edit Experiment" : "Create Experiment" },
        ]}
      />

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
                    setErrorMessage("Basic experiment information must be saved first.");
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
                Previous
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={(currentStep === steps.length - 1 && (!searchLevel || !retMax || !maxComplexes)) || isSubmitting}
                className="gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {currentStep === steps.length - 1 ? (isEditMode ? "Save Experiment" : "Create Experiment") : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        title="Experiment Created"
        message="Experiment configured successfully."
        onClose={handleSuccessClose}
      />

      <ErrorModal
        open={errorModalOpen}
        title="Error"
        message={errorMessage || "An error occurred while creating the experiment."}
        onClose={() => setErrorModalOpen(false)}
      />
    </div>
  );
};

export default CreateExperiment;
