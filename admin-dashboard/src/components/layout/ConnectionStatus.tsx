// src/components/layout/ConnectionStatus.tsx
import React from "react";
import { useAppSelector } from "@/lib/store/hooks"; // Updated import
import { Badge, Tooltip } from "@mui/material";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";

export const ConnectionStatus = () => {
  const socketConnected = useAppSelector((state) => state.ui.socketConnected);

  return (
    <Tooltip
      title={
        socketConnected
          ? "Real-time updates active"
          : "Real-time updates disconnected"
      }
    >
      <Badge
        color={socketConnected ? "success" : "error"}
        variant="dot"
        overlap="circular"
      >
        {socketConnected ? <WifiIcon /> : <WifiOffIcon />}
      </Badge>
    </Tooltip>
  );
};
