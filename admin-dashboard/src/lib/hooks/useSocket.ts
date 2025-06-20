// src/lib/hooks/useSocket.ts
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { socketService } from "@/lib/api/services/socket.service";
import { setSocketStatus } from "@/lib/store/slices/ui.slice";
import { SocketEvent } from "@/lib/socket/socket-events";
import { ContentResponseDto as Content } from "@/lib/types/content";

/**
 * Hook for global socket connection management
 * Handles global socket events and dispatches status to Redux
 */
export function useSocket() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  useEffect(() => {
    // Ensure socket is connected
    socketService.connect(); // Setup additional event handlers for global events
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleConnect = (...args: unknown[]) => {
      console.log("Socket connected successfully");
      dispatch(setSocketStatus(true));

      // Dispatch custom event for other hooks
      window.dispatchEvent(new Event("socket:connected"));
    };

    const handleDisconnect = (...args: unknown[]) => {
      const reason = args[0] as string;
      console.log("Socket disconnected:", reason);
      dispatch(setSocketStatus(false));

      // Dispatch custom event for other hooks
      window.dispatchEvent(new Event("socket:disconnected"));
    };

    const handleConnectError = (...args: unknown[]) => {
      const error = args[0] as Error;
      console.error("Socket connection error:", error);
      dispatch(setSocketStatus(false));

      // Dispatch custom event for other hooks
      window.dispatchEvent(new Event("socket:disconnected"));
    };

    const handleContentUpdated = (...args: unknown[]) => {
      const payload = args[0] as {
        action: string;
        content?: Content;
        id?: string;
      };

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ["content", "list"] });

      // Invalidate specific content query if we have an ID
      if (payload.content?.id) {
        queryClient.invalidateQueries({
          queryKey: ["content", payload.content.id],
        });
      }

      // Emit custom event for UI notifications
      window.dispatchEvent(
        new CustomEvent("content:remote-update", { detail: payload })
      );
    };

    // Add listeners to the socket service
    socketService.addListener("connect", handleConnect);
    socketService.addListener("disconnect", handleDisconnect);
    socketService.addListener("connect_error", handleConnectError);
    socketService.addListener(SocketEvent.ContentUpdated, handleContentUpdated);

    // Clean up event listeners
    return () => {
      socketService.removeListener("connect", handleConnect);
      socketService.removeListener("disconnect", handleDisconnect);
      socketService.removeListener("connect_error", handleConnectError);
      socketService.removeListener(
        SocketEvent.ContentUpdated,
        handleContentUpdated
      );
    };
  }, [dispatch, queryClient]);
}

/**
 * Hook for subscribing to real-time updates for a specific content
 * @param contentId - ID of the content to subscribe to
 * @returns Object containing connection status and last update data
 */
interface ContentUpdate {
  action: string;
  content?: Content;
  id?: string;
  data?: Content;
}

export function useSocketSubscription(contentId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<ContentUpdate | null>(null);
  const queryClient = useQueryClient();
  const subscription = useRef<(() => void) | null>(null);

  // Handle connection status
  useEffect(() => {
    // Ensure socket is connected
    socketService.connect();

    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    // Set up global listeners
    window.addEventListener("socket:connected", handleConnected);
    window.addEventListener("socket:disconnected", handleDisconnected);

    // Check initial connection state
    setIsConnected(socketService.isConnected());

    return () => {
      window.removeEventListener("socket:connected", handleConnected);
      window.removeEventListener("socket:disconnected", handleDisconnected);
    };
  }, []);

  // Subscribe to updates for a specific content
  useEffect(() => {
    if (!contentId) return;

    // Clean up previous subscription if exists
    if (subscription.current) {
      subscription.current();
    } // Create new subscription
    subscription.current = socketService.subscribeToContentUpdates(
      contentId,
      (data) => {
        const typedData = data as ContentUpdate;
        setLastUpdate(typedData);

        // Update the React Query cache
        if (typedData?.data) {
          queryClient.setQueryData(["content", contentId], typedData.data);

          // Show a notification - could dispatch a custom event here
          const event = new CustomEvent("content:updated", {
            detail: typedData,
          });
          window.dispatchEvent(event);
        }
      }
    );

    return () => {
      if (subscription.current) {
        subscription.current();
      }
    };
  }, [contentId, queryClient]);

  return { isConnected, lastUpdate };
}
