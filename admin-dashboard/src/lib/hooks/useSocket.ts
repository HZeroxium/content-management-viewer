// src/lib/hooks/useSocket.ts
import { useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setSocketStatus } from "@/lib/store/slices/ui.slice"; // Changed from setSocketConnected to setSocketStatus
import { useQueryClient } from "@tanstack/react-query";
import { SocketEvent } from "@/lib/socket-events";
import { Content } from "@/types/content";

let socket: Socket | null = null;

export function useSocket() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socket) return; // singleton

    // 1) Connect with JWT
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: `Bearer ${localStorage.getItem("accessToken")}` },
    });

    // 2) Connection state
    socket.on("connect", () => dispatch(setSocketStatus(true)));
    socket.on("disconnect", () => dispatch(setSocketStatus(false)));

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
