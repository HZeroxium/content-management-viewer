// API client with proper auth handling

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Define types for request data and error
type RequestData = Record<string, unknown>;

interface ApiError {
  status: number;
  statusText: string;
  data: unknown;
}

async function makeRequest<T>(
  endpoint: string,
  method: string,
  data?: RequestData
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Safe access to localStorage (only in browser)
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("authToken");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: "include", // Important for cookies
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Making ${method} request to ${endpoint}`);
    const response = await fetch(url, options);

    // For debugging
    console.log(`${method} ${endpoint} response status:`, response.status);

    // Handle 401 (Unauthorized) globally
    if (response.status === 401) {
      console.warn("Authentication required - clearing credentials");

      // Clear auth state
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        document.cookie =
          "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Only redirect from client-side if we're not already on the login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
      throw new Error("Authentication required");
    }

    // Parse the response body
    let responseData;
    const contentType = response.headers.get("content-type");

    if (response.status !== 204) {
      // No Content
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      }
    } else {
      responseData = null;
    }

    if (!response.ok) {
      // Enhanced error logging for debugging
      console.error("API Error Response: ", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        endpoint,
        method,
      });

      throw {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      } as ApiError;
    }

    return responseData as T;
  } catch (error) {
    console.error(`Error in ${method} request to ${endpoint}:`, error);
    throw error;
  }
}

export const apiClient = {
  get: <T>(endpoint: string) => makeRequest<T>(endpoint, "GET"),
  post: <T>(endpoint: string, data: RequestData) =>
    makeRequest<T>(endpoint, "POST", data),
  put: <T>(endpoint: string, data: RequestData) =>
    makeRequest<T>(endpoint, "PUT", data),
  patch: <T>(endpoint: string, data: RequestData) =>
    makeRequest<T>(endpoint, "PATCH", data),
  delete: <T>(endpoint: string) => makeRequest<T>(endpoint, "DELETE"),
};
