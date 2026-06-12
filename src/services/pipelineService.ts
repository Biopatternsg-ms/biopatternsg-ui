import { authFetch } from "@/core/http/httpClient";
import { PIPELINES_ENDPOINT } from "./apiConfig";

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  step: string;
  createdAt: number;
}

export const pipelineService = {
  /**
   * Retrieves the list of pipelines for a given network using authFetch,
   * which automatically injects the Authorization: Bearer token into the headers.
   */
  async getPipelines(networkId?: string | null): Promise<Pipeline[]> {
    const url = networkId 
      ? `${PIPELINES_ENDPOINT}?networkId=${encodeURIComponent(networkId)}`
      : PIPELINES_ENDPOINT;

    const response = await authFetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch pipelines");
    }

    return response.json();
  },
};
