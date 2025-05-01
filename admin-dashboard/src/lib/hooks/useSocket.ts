// src/lib/hooks/useSocket.ts
import { useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setSocketStatus } from "@/lib/store/slices/ui.slice";
import { useQueryClient } from "@tanstack/react-query";
import { SocketEvent } from "@/lib/socket/socket-events";
import { ContentResponseDto as Content } from "@/lib/types/content";

let socket: Socket | null = null;

export function useSocket() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket) return; // singleton

    // 1) Connect with JWT - UPDATE WITH CORRECT PATH!
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      path: "/ws/content", // Add this line to match backend configuration
      auth: { token: `Bearer ${localStorage.getItem("auth_token")}` }, // Also fixed token key to match your axios interceptor
      reconnectionAttempts: 5, // Add reconnection configuration
      reconnectionDelay: 1000, // Start with 1s delay
      reconnectionDelayMax: 5000, // Max 5s delay between reconnection attempts
      timeout: 20000, // Connection timeout
    });

    // 2) Connection state
    socket.on("connect", () => {
      console.log("Socket connected successfully");
      dispatch(setSocketStatus(true));
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      dispatch(setSocketStatus(false));
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      dispatch(setSocketStatus(false));
    });

    // 3) Handle content updates
    socket.on(
      SocketEvent.ContentUpdated,
      (payload: { action: string; content?: Content; id?: string }) => {
        // Invalidate list + detail queries
        queryClient.invalidateQueries({ queryKey: ["content", "list"] });
        if (payload.content?.id) {
          queryClient.invalidateQueries({
            queryKey: ["content", "detail", payload.content.id],
          });
        }
        // You can emit a custom event to UI for toast
        window.dispatchEvent(
          new CustomEvent("content:remote-update", { detail: payload })
        );
      }
    );

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [dispatch, queryClient]);
}
