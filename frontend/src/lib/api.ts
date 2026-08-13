import { ApiError } from "@/lib/api-error";

const API_URL = process.env.API_URL as string;

export function getApiUrl(): string {
  return API_URL;
}

interface FetchApiOptions extends RequestInit {
  token?: string;
  cache?: "force-cache" | "no-store";
  next?: { revalidate: false | 0 | number } | { tags: string[] };
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchApiOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage =
      errorData?.message ||
      errorData?.error ||
      `Erro na requisição: ${response.status}`;
    throw new ApiError(errorMessage, response.status, errorData?.details);
  }

  return response.json() as Promise<T>;
}
