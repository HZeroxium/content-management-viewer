// src/lib/api/endpoints.ts
export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    changePassword: "/auth/change-password",
    profile: "/auth/profile",
  },
  content: {
    root: "/content",
    deleted: "/content/deleted",
    restore: (id: string) => `/content/${id}/restore`,
    permanent: (id: string) => `/content/${id}/permanent`,
    health: "/content/health",
  },
  files: {
    root: "/files",
    upload: "/files/upload",
    storageDelete: (key: string) => `/files/storage/${key}`,
    storageList: "/files/storage/list",
    restore: (id: string) => `/files/${id}/restore`,
    permanent: (id: string) => `/files/${id}/permanent`,
  },
  users: {
    root: "/users",
    deleted: "/users/deleted",
    restore: (id: string) => `/users/${id}/restore`,
    permanent: (id: string) => `/users/${id}/permanent`,
  },
};
