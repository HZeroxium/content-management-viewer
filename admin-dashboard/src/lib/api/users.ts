// src/lib/api/users.ts
import axios from "./axios";
import { User } from "@/types/user";

export interface Paginated<T = User> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getUsers(params: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}): Promise<Paginated<User>> {
  const res = await axios.get("/users", { params });
  return res.data;
}

export async function getUser(id: string): Promise<User> {
  const res = await axios.get(`/users/${id}`);
  return res.data;
}

export async function saveUser(
  user: Partial<User> & { id?: string }
): Promise<User> {
  if (user.id) {
    const res = await axios.patch(`/users/${user.id}`, user);
    return res.data;
  } else {
    const res = await axios.post("/users", user);
    return res.data;
  }
}

export async function deleteUser(id: string): Promise<void> {
  await axios.delete(`/users/${id}`);
}
