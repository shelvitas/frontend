/**
 * Base URL for server-side API calls.
 * - INTERNAL_API_URL: explicit override (set in Docker compose to http://api:4000)
 * - Auto-detects Docker (HOSTNAME env var set by Docker) and swaps localhost → api
 * - Falls back to NEXT_PUBLIC_API_URL for local dev without Docker
 */
function resolveApiUrl(): string {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  const publicUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  // Docker containers have HOSTNAME set — swap localhost for Docker service name
  if (process.env.HOSTNAME) {
    return publicUrl.replace("localhost", "api").replace("127.0.0.1", "api");
  }
  return publicUrl;
}

export const SERVER_API_URL = resolveApiUrl();

/**
 * Server-side fetch helper for SSR pages.
 */
export async function serverFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}
