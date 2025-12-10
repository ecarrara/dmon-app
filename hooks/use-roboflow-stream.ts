"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { webrtc, connectors } from "@roboflow/inference-sdk";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

// Optional params - workspace/workflow are read from env on backend
export interface RoboflowStreamParams {
  imageInputName?: string;
  streamOutputNames?: string[];
  dataOutputNames?: string[];
  workflowsParameters?: Record<string, unknown>;
}

/**
 * Fetch ICE servers (STUN/TURN) from our backend
 */
async function fetchIceServers(): Promise<IceServer[]> {
  try {
    const response = await fetch("/api/turn-config");
    if (!response.ok) {
      console.warn("Failed to fetch ICE servers, using defaults");
      return [{ urls: ["stun:stun.l.google.com:19302"] }];
    }
    const data = await response.json();
    return data.iceServers;
  } catch (error) {
    console.warn("Error fetching ICE servers:", error);
    return [{ urls: ["stun:stun.l.google.com:19302"] }];
  }
}

export interface UseRoboflowStreamOptions {
  onData?: (data: unknown) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: Error) => void;
}

export interface UseRoboflowStreamReturn {
  status: ConnectionStatus;
  remoteStream: MediaStream | null;
  error: string | null;
  connect: (
    source: MediaStream,
    params?: RoboflowStreamParams,
  ) => Promise<void>;
  disconnect: () => Promise<void>;
  reconfigureOutputs: (config: {
    streamOutput?: string[] | null;
    dataOutput?: string[] | null;
  }) => void;
}

export function useRoboflowStream(
  options: UseRoboflowStreamOptions = {},
): UseRoboflowStreamReturn {
  const { onData, onStatusChange, onError } = options;

  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<Awaited<
    ReturnType<typeof webrtc.useStream>
  > | null>(null);

  const updateStatus = useCallback(
    (newStatus: ConnectionStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange],
  );

  const connect = useCallback(
    async (source: MediaStream, params: RoboflowStreamParams = {}) => {
      if (connectionRef.current) return; // Already connected

      try {
        setError(null);
        updateStatus("connecting");

        // Fetch ICE servers (STUN/TURN) before establishing connection
        const iceServers = await fetchIceServers();

        // Secure proxy pattern - API key + workspace/workflow stay on server
        const connector = connectors.withProxyUrl("/api/init-webrtc");

        const connection = await webrtc.useStream({
          source,
          connector,
          wrtcParams: {
            // workspace/workflow NOT passed - backend reads from env
            imageInputName: params.imageInputName ?? "image",
            streamOutputNames: params.streamOutputNames ?? ["label"],
            dataOutputNames: params.dataOutputNames ?? ["*"],
            workflowsParameters: params.workflowsParameters,
            iceServers,
          },
          onData,
        });

        connectionRef.current = connection;
        const remote = await connection.remoteStream();
        setRemoteStream(remote);
        updateStatus("connected");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Connection failed";
        setError(msg);
        updateStatus("error");
        onError?.(err instanceof Error ? err : new Error(msg));
      }
    },
    [onData, onError, updateStatus],
  );

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.cleanup();
      connectionRef.current = null;
    }
    setRemoteStream(null);
    setError(null);
    updateStatus("disconnected");
  }, [updateStatus]);

  const reconfigureOutputs = useCallback(
    (config: {
      streamOutput?: string[] | null;
      dataOutput?: string[] | null;
    }) => {
      connectionRef.current?.reconfigureOutputs(config);
    },
    [],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      connectionRef.current?.cleanup();
    };
  }, []);

  return {
    status,
    remoteStream,
    error,
    connect,
    disconnect,
    reconfigureOutputs,
  };
}
