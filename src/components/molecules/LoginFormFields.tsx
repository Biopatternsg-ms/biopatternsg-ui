import * as React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { LoginFormValues } from "@/adapters/authAdapter";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";

export interface LoginFormFieldsProps {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
}

const LoginFormFields = ({ register, errors }: LoginFormFieldsProps) => {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          type="email"
          placeholder="name@institute.edu"
          aria-invalid={!!errors.username}
          {...register("username")}
        />
        <p className="text-[11px] text-on-surface-variant font-label font-medium tracking-wide">
          Ingresa tu correo electrónico
        </p>
        {errors.username && (
          <ErrorMessage>{errors.username.message}</ErrorMessage>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <div className="flex justify-end">
          <a
            href="#"
            className="text-[11px] text-primary font-bold uppercase tracking-widest hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        {errors.password && (
          <ErrorMessage>{errors.password.message}</ErrorMessage>
        )}
      </div>
    </div>
  );
};

const ErrorMessage = ({ children }: { children: React.ReactNode }) => (
  <p role="alert" className="text-[11px] text-error font-label font-medium tracking-wide">
    {children}
  </p>
);

LoginFormFields.displayName = "LoginFormFields";

export { LoginFormFields };
