// src/lib/api/files.ts
import axios from "./axios";
import { FILES } from "./endpoints";

export interface UploadResponse {
  url: string;
  fileId: string;
}

export const uploadFile = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> => {
  const form = new FormData();
  form.append("file", file);

  const response = await axios.post<UploadResponse>(FILES.upload, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return response.data;
};
