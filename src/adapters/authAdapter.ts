import type {
  LoginPayload,
  RecoveryPasswordPayload,
} from "@/domain/models/Auth";

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

export interface RecoveryFormValues {
  email: string;
}

export function toRecoveryPayload(
  formValues: RecoveryFormValues
): RecoveryPasswordPayload {
  return {
    username: formValues.email.trim().toLowerCase(),
  };
}
