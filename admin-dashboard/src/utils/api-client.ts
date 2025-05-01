// /src/utils/api-client.ts

import axios from "@/lib/api/axios";
import { AxiosRequestConfig } from "axios";

// Simple wrapper around axios that returns data directly
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axios.get(url, config);
    return response.data;
  },

  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axios.post(url, data, config);
    return response.data;
  },

  patch: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axios.patch(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axios.delete(url, config);
    return response.data;
  },
};

// Add interceptors to log detailed error information
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Log more details about the error
      console.error("API Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        endpoint: error.config.url,
        method: error.config.method,
      });
    }
    return Promise.reject(error);
  }
);
