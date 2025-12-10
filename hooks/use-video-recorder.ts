"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVideoRecorderReturn {
  isRecording: boolean;
  recordingDuration: number;
  startRecording: (
    stream: MediaStream,
    onChunkReady: (blob: Blob) => void
  ) => void;
  stopRecording: () => void;
}

export function useVideoRecorder(): UseVideoRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkCallbackRef = useRef<((blob: Blob) => void) | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(
    (stream: MediaStream, onChunkReady: (blob: Blob) => void) => {
      if (!MediaRecorder.isTypeSupported("video/webm")) {
        console.error("video/webm is not supported");
        return;
      }

      try {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        chunkCallbackRef.current = onChunkReady;
        startTimeRef.current = Date.now();

        // Handle data available event (every 30 seconds)
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            const endTime = Date.now();
            console.log(
              `Video chunk ready: ${event.data.size} bytes (${startTimeRef.current} - ${endTime})`
            );

            // Call the callback with the blob
            if (chunkCallbackRef.current) {
              chunkCallbackRef.current(event.data);
            }

            // Update start time for next chunk
            startTimeRef.current = endTime;
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setIsRecording(false);
        };

        mediaRecorder.onstop = () => {
          setIsRecording(false);
          setRecordingDuration(0);
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
        };

        // Start recording with 30-second chunks
        mediaRecorder.start(30000); // timeslice: 30000ms = 30 seconds
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);

        // Track recording duration
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration(
            Math.floor((Date.now() - startTimeRef.current) / 1000)
          );
        }, 1000);

        console.log("Video recording started (30s chunks)");
      } catch (error) {
        console.error("Error starting video recording:", error);
      }
    },
    []
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      chunkCallbackRef.current = null;

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      console.log("Video recording stopped");
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
  };
}
