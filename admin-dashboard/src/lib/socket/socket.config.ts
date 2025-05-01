// src/lib/socket/socket.config.ts
import { ManagerOptions, SocketOptions } from "socket.io-client";

export const socketConfig: Partial<ManagerOptions & SocketOptions> = {
  path: "/ws/content",
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
};

export const getSocketAuthToken = (): { token: string } => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  return {
    token: token ? `Bearer ${token}` : "",
  };
};
