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
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Breadcrumb } from "@/components/molecules/Breadcrumb";
import { Stepper, type Step } from "@/components/molecules/Stepper";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { StepGeneralConfig } from "./createExperiment/StepGeneralConfig";
import { StepModelParameters } from "./createExperiment/StepModelParameters";
import { StepExpertObjects } from "./createExperiment/StepExpertObjects";
import { StepSearchConfig } from "./createExperiment/StepSearchConfig";
import { experimentService } from "@/services/experimentService";
import { expertObjectsToCsvFile } from "@/utils/csvParser";
import { toExperimentDomain, toCreateExperimentPayload } from "@/adapters/experimentAdapter";
import type { Experiment, TranscriptionFactorConfig } from "@/domain/models/Experiment";
import {
  createExperimentSchema,
  type CreateExperimentFormValues,
} from "@/schemas/experiments/createExperimentSchema";

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

export const CreateExperiment = () => {
  const navigate = useNavigate();
  const { networkId, experimentId } = useParams<{ networkId: string; experimentId: string }>();
  const isEditMode = !!experimentId;
  const [currentStep, setCurrentStep] = useState(0);

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const methods = useForm<CreateExperimentFormValues>({
    resolver: zodResolver(createExperimentSchema) as unknown as Resolver<CreateExperimentFormValues>,
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      sourceSelection: "JASPAR",
      genome: "",
      track: "",
      identity: "",
      chromosome: "",
      strand: "",
      start: "",
      end: "",
      reliability: "",
      promoterRegion: "",
      expertObjectsFile: null,
      expertObjectsList: [],
      searchLevel: "",
      retMax: "",
      maxComplexes: "",
      useOnlyPrincipalName: true,
    },
  });

  useEffect(() => {
    if (!experimentId) {
      return;
    }

    const fetchExperiment = async () => {
      setIsSubmitting(true);
      try {
        const data = await experimentService.getPipelineById(experimentId);
        setExperiment(data);

        const tfConfig = data.transcriptionFactorConfig;
        const hasJaspar = tfConfig?.sources?.includes("JASPAR") ?? false;
        const hasTfBind = tfConfig?.sources?.includes("TFBIND") ?? false;
        const sourceSelection = hasJaspar && hasTfBind ? "BOTH" : hasJaspar ? "JASPAR" : "TFBIND";

        const expertFile =
          data.expertObjects && data.expertObjects.length > 0
            ? expertObjectsToCsvFile(data.expertObjects)
            : null;

        methods.reset({
          name: data.name ?? "",
          description: data.description ?? "",
          sourceSelection,
          genome: tfConfig?.genome ?? "",
          track: tfConfig?.track ?? "",
          identity: tfConfig?.identity !== undefined && tfConfig.identity !== null ? String(tfConfig.identity) : "",
          chromosome: tfConfig?.chromosome ?? "",
          strand: tfConfig?.strand ?? "",
          start: tfConfig?.start !== undefined && tfConfig.start !== null ? String(tfConfig.start) : "",
          end: tfConfig?.end !== undefined && tfConfig.end !== null ? String(tfConfig.end) : "",
          reliability: tfConfig?.reliability !== undefined && tfConfig.reliability !== null ? String(tfConfig.reliability) : "",
          promoterRegion: tfConfig?.promoterRegion ?? "",
          expertObjectsFile: expertFile,
          expertObjectsList: data.expertObjects ?? [],
          searchLevel: data.levels !== undefined && data.levels !== null ? String(data.levels) : "",
          retMax: data.retMax !== undefined && data.retMax !== null ? String(data.retMax) : "",
          maxComplexes: data.maxComplexes !== undefined && data.maxComplexes !== null ? String(data.maxComplexes) : "",
          useOnlyPrincipalName: data.useOnlyPrincipalName ?? true,
        });
      } catch {
        setErrorMessage("Could not load experiment data.");
        setErrorModalOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    };

    fetchExperiment();
  }, [experimentId, methods]);

  const handleNext = async () => {
    if (currentStep === 0) {
      const valid = await methods.trigger(["name", "description"]);
      if (!valid) return;

      const { name, description } = methods.getValues();
      const resolvedNetworkId = networkId || experiment?.networkId || "";

      if (!resolvedNetworkId && !experiment?.id) {
        setErrorMessage("Missing network ID.");
        setErrorModalOpen(true);
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = toCreateExperimentPayload({
          networkId: resolvedNetworkId,
          name,
          description,
        });

        const response = experiment?.id
          ? await experimentService.updatePipelineDescription(experiment.id, experiment.name ?? "", payload.description)
          : await experimentService.createPipeline(payload.networkId, payload.name, payload.description);

        if (response.ok) {
          const raw = await response.json();
          const data: Experiment = toExperimentDomain(raw);
          setExperiment(data);
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

      const values = methods.getValues();
      const fieldsToValidate: (keyof CreateExperimentFormValues)[] = ["sourceSelection", "promoterRegion"];

      if (values.sourceSelection === "JASPAR" || values.sourceSelection === "BOTH") {
        fieldsToValidate.push("genome", "track", "identity", "chromosome", "strand", "start", "end");
      }
      if (values.sourceSelection === "TFBIND" || values.sourceSelection === "BOTH") {
        fieldsToValidate.push("reliability");
      }

      const valid = await methods.trigger(fieldsToValidate);
      if (!valid) return;

      const sources: string[] = [];
      if (values.sourceSelection === "JASPAR") sources.push("JASPAR");
      else if (values.sourceSelection === "TFBIND") sources.push("TFBIND");
      else if (values.sourceSelection === "BOTH") {
        sources.push("JASPAR");
        sources.push("TFBIND");
      }

      const tfConfig: TranscriptionFactorConfig = {
        sources,
        reliability: Number(values.reliability),
        promoterRegion: values.promoterRegion,
        ...(values.sourceSelection !== "TFBIND" && {
          genome: values.genome,
          track: values.track,
          identity: Number(values.identity),
          chromosome: values.chromosome,
          strand: values.strand,
          start: values.start,
          end: values.end,
        }),
      };

      setIsSubmitting(true);
      try {
        const response = await experimentService.updatePipeline(experiment.id, tfConfig);
        if (response.ok) {
          const raw = await response.json();
          const updatedData: Experiment = toExperimentDomain(raw);
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

      const { expertObjectsFile, expertObjectsList } = methods.getValues();
      if (!expertObjectsFile && (!expertObjectsList || expertObjectsList.length === 0)) {
        setCurrentStep((prev) => prev + 1);
        return;
      }

      setIsSubmitting(true);
      try {
        const objectsToSend = expertObjectsList.length > 0 ? expertObjectsList : (experiment.expertObjects ?? []);
        const response = await experimentService.updateExperimentConfiguration(
          experiment.id,
          objectsToSend
        );
        if (response.ok) {
          const raw = await response.json();
          const updatedData: Experiment = toExperimentDomain(raw);
          setExperiment(updatedData);
          setCurrentStep((prev) => prev + 1);
        } else {
          setErrorMessage("Error updating expert objects.");
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

      const valid = await methods.trigger([
        "searchLevel",
        "retMax",
        "maxComplexes",
        "useOnlyPrincipalName",
      ]);
      if (!valid) return;

      const { searchLevel, retMax, maxComplexes, useOnlyPrincipalName } = methods.getValues();

      setIsSubmitting(true);
      try {
        const response = await experimentService.updateSearchConfig(
          experiment.id,
          Number(searchLevel),
          Number(retMax),
          useOnlyPrincipalName,
          Number(maxComplexes)
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
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    navigate(networkId ? `/dashboard/experiments/${networkId}` : "/dashboard/network");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepGeneralConfig nameReadOnly={!!experiment?.id} />;
      case 1:
        return <StepModelParameters />;
      case 2:
        return (
          <StepExpertObjects
            expertObjects={experiment?.expertObjects}
            onError={(msg) => {
              setErrorMessage(msg);
              setErrorModalOpen(true);
            }}
          />
        );
      case 3:
        return <StepSearchConfig />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          className="mb-6"
          onNavigate={navigate}
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
          <h2 className="text-2xl font-black font-headline tracking-tight text-on-surface">
            {isEditMode ? "Edit Experiment" : "Create Experiment"}
          </h2>
          <p className="text-sm text-on-surface-variant font-body">
            Configure the experimental pipeline parameters and transcription factors step by step.
          </p>
        </div>

        {/* Stepper Wizard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-outline-variant/15 shadow-sm">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          <div className="lg:col-span-8">
            <div className="glass-panel p-8 rounded-2xl border border-outline-variant/15 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {renderStepContent()}

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-outline-variant/15">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0 || isSubmitting}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {currentStep === steps.length - 1
                      ? isEditMode
                        ? "Save Changes"
                        : "Create Experiment"
                      : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SuccessModal
          open={successModalOpen}
          onClose={handleSuccessClose}
          title={isEditMode ? "Experiment Updated!" : "Experiment Created!"}
          message={
            isEditMode
              ? "The experiment search configuration was updated successfully."
              : "The experiment has been created and configured successfully. You can now execute the pipeline."
          }
        />

        <ErrorModal
          open={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          title="Operation Failed"
          message={errorMessage}
        />
      </div>
    </FormProvider>
  );
};

export default CreateExperiment;
