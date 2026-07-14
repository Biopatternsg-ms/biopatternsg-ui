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
import * as React from "react";
import { useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { ErrorModal } from "@/components/molecules/ErrorModal";
import { SuccessModal } from "@/components/molecules/SuccessModal";
import { FormField } from "@/components/molecules/FormField";
import type { DataFormConfig } from "./DataFormConfig";

export interface DataFormProps<T extends FieldValues> {
  config: DataFormConfig<T>;
}

export const DataForm = <T extends FieldValues>({ config }: DataFormProps<T>) => {
  const navigate = useNavigate();
  const [successModalOpen, setSuccessModalOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(config.errorModal.defaultMessage);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    resolver: zodResolver(config.schema) as unknown as Resolver<T>,
    mode: "onTouched",
    defaultValues: {} as DefaultValues<T>
  });

  const onSubmit = async (values: T) => {
    setErrorModalOpen(false);
    try {
      const response = await config.onSubmit(values);

      const isSuccess =
        config.successStatus === "ok" ? response.ok : response.status === config.successStatus;

      if (isSuccess) {
        if (config.onSuccessResponse) {
          await config.onSuccessResponse(response);
        }
        setSuccessModalOpen(true);
        return;
      }

      let errorMsg = config.errorModal.defaultMessage;

      // Attempt to parse response if requested (like 401 or 400 responses)
      if (config.errorModal.parseResponseMessage && response.status >= 400 && response.status < 500) {
        try {
          const resJson = await response.json();
          if (resJson && typeof resJson.message === "string") {
            errorMsg = resJson.message;
          } else if (resJson && typeof resJson.error === "string") {
            errorMsg = resJson.error;
          }
        } catch {
          // Fallback to default
        }
      }

      setErrorMessage(errorMsg);
      setErrorModalOpen(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "No se pudo conectar con el servidor. Verifique su conexión de red.";
      setErrorMessage(message);
      setErrorModalOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    if (config.onSuccessClose) {
      config.onSuccessClose();
    }
  };

  const handleErrorClose = () => {
    setErrorModalOpen(false);
    if (config.onErrorClose) {
      config.onErrorClose();
    }
  };

  return (
    <>
      <div className="glass-panel p-8 rounded-2xl border border-outline-variant/15 shadow-xl relative overflow-hidden">
        {/* Decorative background blur orb */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black font-headline tracking-tight text-on-surface mb-2">
            {config.title}
          </h2>
          {config.subtitle && (
            <p className="text-sm text-on-surface-variant font-label uppercase tracking-wider mb-8">
              {config.subtitle}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* Dynamic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.fields.map((field) => (
                <div
                  key={field.name}
                  className={field.colSpan === "half" ? "col-span-1" : "col-span-1 sm:col-span-2"}
                >
                  <FormField
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    aria-invalid={!!errors[field.name]}
                    labelRight={field.labelRight}
                    rows={field.rows}
                    {...register(field.name as Path<T>)}
                  />
                  {field.helperText && !errors[field.name] && (
                    <p className="text-[11px] text-on-surface-variant font-label font-medium tracking-wide mt-1">
                      {field.helperText}
                    </p>
                  )}
                  {errors[field.name] && (
                    <p
                      role="alert"
                      className="text-[11px] text-error font-label font-medium tracking-wide mt-1"
                    >
                      {String(errors[field.name]?.message)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {config.submittingLabel}
                </>
              ) : (
                config.submitLabel
              )}
            </Button>
          </form>

          {/* Optional Footer Link */}
          {config.footerLink && (
            <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-sm text-on-surface-variant">
                {config.footerLink.text}
              </p>
              <Button
                variant="link"
                className="mt-2 text-sm"
                type="button"
                onClick={() => navigate(config.footerLink!.to)}
              >
                {config.footerLink.label}
              </Button>
            </div>
          )}
        </div>
      </div>

      <SuccessModal
        open={successModalOpen}
        title={config.successModal.title}
        message={config.successModal.message}
        onClose={handleSuccessClose}
      />

      <ErrorModal
        open={errorModalOpen}
        title={config.errorModal.title || "Error"}
        message={errorMessage}
        onClose={handleErrorClose}
      />
    </>
  );
};
