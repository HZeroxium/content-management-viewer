// src/lib/api/content.ts
import axios from "./axios";
import { Content } from "@/types/content";

export interface PaginatedContent<T = Content> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getContentList(params: {
  page?: number;
  limit?: number;
}): Promise<PaginatedContent> {
  const res = await axios.get("/content", { params });
  return res.data;
}

export async function getContentById(id: string): Promise<Content> {
  const res = await axios.get(`/content/${id}`);
  return res.data.content;
}

export async function saveContent(
  payload: Partial<Content> & { id?: string }
): Promise<Content> {
  if (payload.id) {
    const res = await axios.patch(`/content/${payload.id}`, payload);
    return res.data;
  } else {
    const res = await axios.post("/content", payload);
    return res.data;
  }
}

export async function deleteContent(id: string): Promise<void> {
  await axios.delete(`/content/${id}`);
}
