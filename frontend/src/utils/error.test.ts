import { describe, it, expect } from "vitest";
import { getApiError } from "./error";

describe("getApiError", () => {
  it("returns the error message from an Axios-style response", () => {
    const err = { response: { data: { error: "User not found" } } };
    expect(getApiError(err)).toBe("User not found");
  });

  it("returns the fallback when response.data.error is missing", () => {
    const err = { response: { data: {} } };
    expect(getApiError(err, "Default error")).toBe("Default error");
  });

  it("returns the fallback when response is missing", () => {
    const err = { response: undefined };
    expect(getApiError(err, "Fallback")).toBe("Fallback");
  });

  it("returns err.message for a plain Error instance", () => {
    const err = new Error("Network failure");
    expect(getApiError(err)).toBe("Network failure");
  });

  it("returns the default fallback for null", () => {
    expect(getApiError(null)).toBe("An unexpected error occurred.");
  });

  it("returns the default fallback for a string", () => {
    expect(getApiError("oops")).toBe("An unexpected error occurred.");
  });

  it("uses a custom fallback string", () => {
    expect(getApiError(null, "Custom fallback")).toBe("Custom fallback");
  });
});
