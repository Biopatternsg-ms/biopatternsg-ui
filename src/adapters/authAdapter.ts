import type { LoginPayload } from "@/domain/models/Auth";

export interface LoginFormValues {
  username: string;
  password: string;
}

export function toLoginPayload(formValues: LoginFormValues): LoginPayload {
  return {
    username: formValues.username.trim().toLowerCase(),
    password: formValues.password,
  };
}
