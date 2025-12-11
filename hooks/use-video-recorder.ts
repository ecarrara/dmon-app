"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVideoRecorderReturn {
  isRecording: boolean;
  recordingDuration: number;
  startRecording: (
    stream: MediaStream,
    onChunkReady: (blob: Blob) => void | Promise<void>
  ) => void;
  stopRecording: () => Promise<void>;
}

export function useVideoRecorder(): UseVideoRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkCallbackRef = useRef<((blob: Blob) => void | Promise<void>) | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChunkUploadRef = useRef<Promise<void> | null>(null);
  const stopPromiseResolveRef = useRef<(() => void) | null>(null);

  const startRecording = useCallback(
    (stream: MediaStream, onChunkReady: (blob: Blob) => void | Promise<void>) => {
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

            // Call the callback with the blob and track the promise if async
            if (chunkCallbackRef.current) {
              const result = chunkCallbackRef.current(event.data);
              if (result instanceof Promise) {
                pendingChunkUploadRef.current = result;
              }
            }

            // Update start time for next chunk
            startTimeRef.current = endTime;
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setIsRecording(false);
        };

        mediaRecorder.onstop = async () => {
          setIsRecording(false);
          setRecordingDuration(0);
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }

          // Wait for any pending chunk upload to complete
          if (pendingChunkUploadRef.current) {
            try {
              await pendingChunkUploadRef.current;
            } catch (error) {
              console.error("Error waiting for final chunk upload:", error);
            }
            pendingChunkUploadRef.current = null;
          }

          // Clean up refs now that we're done
          mediaRecorderRef.current = null;
          chunkCallbackRef.current = null;

          // Resolve the stop promise if waiting
          if (stopPromiseResolveRef.current) {
            stopPromiseResolveRef.current();
            stopPromiseResolveRef.current = null;
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

  const stopRecording = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        // Store the resolve function to be called when onstop completes
        stopPromiseResolveRef.current = resolve;

        // Call stop - this will trigger ondataavailable (with final chunk) then onstop
        mediaRecorderRef.current.stop();

        // Don't null out chunkCallbackRef yet! The final ondataavailable event
        // needs it to upload the last chunk. It will be cleared in onstop.

        console.log("Video recording stopped");
      } else {
        // Not recording, resolve immediately
        resolve();
      }
    });
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
