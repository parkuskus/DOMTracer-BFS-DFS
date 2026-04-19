// =============================================================================
// api.ts — Fetch ke backend Go, payload cocok persis dengan traverseRequest
// =============================================================================

import type { ApiResponse, FormState, TraverseRequest } from "../types";

/**
 * Base URL backend Go.
 * Development : set VITE_API_BASE_URL=http://localhost:8080 di file .env
 * Production  : ganti dengan URL deploy (Railway, Render, dll.)
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/**
 * Konversi FormState (dari InputForm) → TraverseRequest (payload ke backend).
 * Semua field name harus cocok persis dengan struct traverseRequest di main.go.
 */
function buildPayload(form: FormState): TraverseRequest {
  return {
    input: form.inputValue,
    inputMode: form.inputMode,
    algorithm: form.algorithm,
    cssSelector: form.cssSelector,
    // Konversi ResultLimit union → angka integer yang dipahami backend
    // 0 berarti "semua", N berarti "top-N"
    limit: form.resultLimit.type === "top-n" ? form.resultLimit.n : 0,
  };
}

/**
 * Kirim request traversal ke backend dan kembalikan ApiResponse.
 * Throws Error jika HTTP status non-2xx atau JSON tidak bisa di-parse.
 */
export async function runTraversal(form: FormState): Promise<ApiResponse> {
  const payload = buildPayload(form);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/traverse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    // Koneksi gagal total (backend tidak jalan, CORS block, dll.)
    throw new Error(
      `Cannot reach backend at ${API_BASE_URL}. ` +
      `Pastikan server Go sudah berjalan dengan: go run ./backend/main.go`
    );
  }

  // Coba baca body terlepas dari status code
  const text = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Backend returned non-JSON response (status ${response.status}): ${text.slice(0, 200)}`);
  }

  // Handle error dari backend (format: { "error": "..." })
  if (!response.ok) {
    const errMsg =
      (data as { error?: string })?.error ??
      `Server error ${response.status}: ${response.statusText}`;
    throw new Error(errMsg);
  }

  return data as ApiResponse;
}