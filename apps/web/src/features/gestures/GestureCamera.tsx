import { useEffect, useRef, useState } from "react";
import {
  GestureStateMachine,
  type GestureSnapshot,
  type SupportedGesture,
} from "./gesture-state-machine";
import { createGestureRecognizer, primaryGesture } from "./mediapipe";

interface Props {
  enabled: boolean;
  onGesture: (gesture: SupportedGesture) => void;
}

const initial: GestureSnapshot = {
  phase: "NEUTRAL",
  gesture: null,
  progress: 0,
  confirmed: null,
};

export function GestureCamera({ enabled, onGesture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const callbackRef = useRef(onGesture);
  const [snapshot, setSnapshot] = useState(initial);
  const [status, setStatus] = useState("Preparando gestos…");
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    callbackRef.current = onGesture;
  }, [onGesture]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let frame = 0;
    let stream: MediaStream | undefined;
    let recognizer: Awaited<ReturnType<typeof createGestureRecognizer>>;
    let lastDetection = 0;
    let lastPhase = "NEUTRAL";
    let lastGesture = "";
    const machine = new GestureStateMachine();

    async function start() {
      setFailed(false);
      setStatus("Preparando gestos…");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "user", width: { ideal: 640 } },
        });
        if (!active || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        recognizer = await createGestureRecognizer();
        if (!active) return;
        setStatus("Cámara activa · muestra tu pulgar");

        const detect = () => {
          if (!active || !videoRef.current) return;
          const now = performance.now();
          if (
            document.visibilityState === "visible" &&
            videoRef.current.readyState >= 2 &&
            now - lastDetection >= 80
          ) {
            lastDetection = now;
            const result = recognizer.recognizeForVideo(videoRef.current, now);
            const gesture = primaryGesture(result);
            const next = machine.update(gesture.name, gesture.confidence, now);
            const detectedGesture = gesture.name ?? "None";
            if (
              next.phase !== lastPhase ||
              detectedGesture !== lastGesture ||
              next.confirmed
            ) {
              console.log("[NatyArte gestures]", {
                detected: detectedGesture,
                confidence: Number(gesture.confidence.toFixed(3)),
                phase: next.phase,
                progress: `${Math.round(next.progress * 100)}%`,
                confirmed: next.confirmed,
              });
              lastPhase = next.phase;
              lastGesture = detectedGesture;
            }
            setSnapshot(next);
            if (next.confirmed) {
              console.log(
                `[NatyArte gestures] Acción disparada: ${next.confirmed === "Thumb_Up" ? "like" : "recommendations"}`,
              );
              callbackRef.current(next.confirmed);
            }
          }
          frame = requestAnimationFrame(detect);
        };
        frame = requestAnimationFrame(detect);
      } catch {
        stream?.getTracks().forEach((track) => track.stop());
        setFailed(true);
        setStatus("No se pudo iniciar el reconocimiento de gestos.");
      }
    }

    void start();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      recognizer?.close();
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [enabled, retry]);

  if (!enabled) return null;
  const gestureLabel =
    snapshot.gesture === "Thumb_Up"
      ? "👍"
      : snapshot.gesture === "Thumb_Down"
        ? "👎"
        : "👋";
  return (
    <div className="gesture-camera" aria-live="polite">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-label="Vista previa de la cámara"
      />
      <div className="gesture-status">
        <span aria-hidden="true">{gestureLabel}</span>
        <div>
          <b>{status}</b>
          <div
            className="gesture-progress"
            aria-label={`Progreso ${Math.round(snapshot.progress * 100)}%`}
          >
            <i style={{ width: `${snapshot.progress * 100}%` }} />
          </div>
          <small>Mantén el gesto durante 0,7 segundos.</small>
          {failed && (
            <button
              className="gesture-retry"
              onClick={() => setRetry((value) => value + 1)}
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
