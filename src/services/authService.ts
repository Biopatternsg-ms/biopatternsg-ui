import { LOGIN_ENDPOINT } from "@/services/apiConfig";
import type { LoginPayload } from "@/domain/models/Auth";

export async function loginUser(payload: LoginPayload): Promise<Response> {
  return fetch(LOGIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function saveSession(data: unknown): void {
  localStorage.setItem("auth_session", JSON.stringify(data));
}

export function getSession(): unknown | null {
  const raw = localStorage.getItem("auth_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem("auth_session");
}
