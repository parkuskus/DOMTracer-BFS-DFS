import type { ApiResponse, TraverseRequest } from "./types";
import type { FormState } from "../components/InputForm";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function buildPayload(form: FormState): TraverseRequest {
  return {
    input: form.inputValue,
    inputMode: form.inputMode === "file" ? "html" : form.inputMode,
    algorithm: form.algorithm,
    cssSelector: form.cssSelector,
    limit: form.limitType === "top-n" ? form.topN : 0,
  };
}

export async function runTraversal(form: FormState): Promise<ApiResponse> {
  const payload = buildPayload(form);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/traverse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      `Tidak bisa terhubung ke backend di ${API_BASE_URL}. ` +
      `Pastikan server sudah berjalan: go run ./main.go`
    );
  }

  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Backend mengembalikan non-JSON (status ${response.status}): ${text.slice(0, 200)}`
    );
  }

  if (!response.ok) {
    const errMsg =
      (data as { error?: string })?.error ??
      `Server error ${response.status}: ${response.statusText}`;
    throw new Error(errMsg);
  }

  return data as ApiResponse;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
