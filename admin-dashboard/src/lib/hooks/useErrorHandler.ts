import { useState, useCallback } from "react";
import { getErrorMessage } from "../types/error";

interface ErrorHandlerOptions {
  logErrors?: boolean;
}

/**
 * Custom hook for handling errors consistently across the application
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { logErrors = true } = options;
  const [error, setError] = useState<unknown | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleError = useCallback(
    (err: unknown) => {
      setError(err);
      const message = getErrorMessage(err);
      setErrorMessage(message);

      if (logErrors) {
        console.error("Error caught by useErrorHandler:", err);
      }

      return message;
    },
    [logErrors]
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorMessage("");
  }, []);

  return {
    error,
    errorMessage,
    isError: !!error,
    handleError,
    clearError,
  };
}
