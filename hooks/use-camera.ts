"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface CameraState {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
}

export function useCamera() {
  const [state, setState] = useState<CameraState>({
    stream: null,
    isActive: false,
    error: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setState({
        stream: null,
        isActive: false,
        error: "Camera is not supported by this browser",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front camera for driver-facing view
          width: { ideal: 620 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      setState({
        stream,
        isActive: true,
        error: null,
      });

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      let errorMessage = "Failed to access camera";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Camera permission denied";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is in use by another application";
        }
      }

      setState({
        stream: null,
        isActive: false,
        error: errorMessage,
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState({
      stream: null,
      isActive: false,
      error: null,
    });
  }, [state.stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [state.stream]);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
  };
}
