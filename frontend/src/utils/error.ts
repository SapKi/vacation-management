/**
 * Extracts a human-readable message from an unknown Axios (or any) error.
 * Replaces the `err: any` pattern scattered across catch blocks.
 */
export function getApiError(err: unknown, fallback = "An unexpected error occurred."): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { error?: string } } };
    return axiosErr.response?.data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
