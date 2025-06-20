import { io, Socket } from "socket.io-client";
import { store } from "../../store/store";
import { setSocketStatus } from "../../store/slices/ui.slice";

class SocketService {
  private socket: Socket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private eventListeners: Map<string, ((...args: unknown[]) => void)[]> =
    new Map();

  constructor() {
    this.setupSocketListeners = this.setupSocketListeners.bind(this);
  }

  connect() {
    if (this.socket) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Get token from localStorage if available
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    this.socket = io(API_URL, {
      path: "/ws/content", // Must match the backend path configuration
      withCredentials: true,
      auth: token ? { token } : undefined,
      transports: ["websocket", "polling"],
    });

    this.setupSocketListeners();
  }

  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      store.dispatch(setSocketStatus(true));
      this.resetReconnectAttempts();

      // Fire event listeners
      this.triggerListeners("connect");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      store.dispatch(setSocketStatus(false));
      this.attemptReconnect();

      // Fire event listeners
      this.triggerListeners("disconnect");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      store.dispatch(setSocketStatus(false));
      this.attemptReconnect();

      // Fire event listeners
      this.triggerListeners("connect_error", error);
    });

    // Listen for content updates to trigger event listeners
    this.socket.on("contentUpdated", (data) => {
      this.triggerListeners("contentUpdated", data);
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.log("Max reconnection attempts reached");
      return;
    }

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }

    this.reconnectInterval = setTimeout(() => {
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts + 1}/${
          this.MAX_RECONNECT_ATTEMPTS
        })`
      );
      this.reconnectAttempts++;
      this.connect();
    }, 3000); // 3 seconds between attempts
  }

  resetReconnectAttempts() {
    this.reconnectAttempts = 0;
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  // Check if socket is currently connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Add event listener
  addListener(event: string, callback: (...args: unknown[]) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  // Remove event listener
  removeListener(event: string, callback: (...args: unknown[]) => void) {
    if (!this.eventListeners.has(event)) return;

    const callbacks = this.eventListeners.get(event) || [];
    const index = callbacks.indexOf(callback);

    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  // Trigger all event listeners for an event
  private triggerListeners(event: string, ...args: unknown[]) {
    const callbacks = this.eventListeners.get(event) || [];
    callbacks.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in ${event} event listener:`, error);
      }
    });
  }

  // Subscribe to content updates for specific ID
  subscribeToContentUpdates(
    contentId: string,
    callback: (data: unknown) => void
  ) {
    if (!this.socket) this.connect();

    // Listen for all content updates
    const contentUpdateHandler = (data: unknown) => {
      // Only process updates for the specific content we're watching
      if (
        (data &&
          typeof data === "object" &&
          "id" in data &&
          (data as { id: string }).id === contentId) ||
        (data &&
          typeof data === "object" &&
          "data" in data &&
          (data as { data?: { id?: string } }).data?.id === contentId)
      ) {
        callback(data);
      }
    };

    this.socket?.on("contentUpdated", contentUpdateHandler);

    // Notify server about which content we're watching
    this.socket?.emit("watchContent", { contentId });

    return () => {
      this.socket?.off("contentUpdated", contentUpdateHandler);
      this.socket?.emit("unwatchContent", { contentId });
    };
  }
}

export const socketService = new SocketService();

// Initialize socket connection on import
if (typeof window !== "undefined") {
  socketService.connect();
}
