export const GESTURE_CONFIDENCE_THRESHOLD = 0.5;
export const GESTURE_HOLD_MS = 700;
export const GESTURE_LOST_GRACE_MS = 240;
export type SupportedGesture = "Thumb_Up" | "Thumb_Down";
export type GesturePhase = "NEUTRAL" | "HOLDING" | "CONFIRMED" | "LOCKED";

export interface GestureSnapshot {
  phase: GesturePhase;
  gesture: SupportedGesture | null;
  progress: number;
  confirmed: SupportedGesture | null;
}

export class GestureStateMachine {
  private phase: GesturePhase = "NEUTRAL";
  private gesture: SupportedGesture | null = null;
  private startedAt = 0;
  private lastSeenAt = 0;

  update(
    detected: string | undefined,
    confidence: number,
    now: number,
  ): GestureSnapshot {
    const supported =
      confidence >= GESTURE_CONFIDENCE_THRESHOLD &&
      (detected === "Thumb_Up" || detected === "Thumb_Down")
        ? detected
        : null;

    if (!supported) {
      if (
        this.phase !== "NEUTRAL" &&
        now - this.lastSeenAt <= GESTURE_LOST_GRACE_MS
      ) {
        return {
          ...this.snapshot(),
          progress:
            this.phase === "HOLDING"
              ? Math.min(1, (now - this.startedAt) / GESTURE_HOLD_MS)
              : 0,
        };
      }
      this.reset();
      return this.snapshot();
    }
    this.lastSeenAt = now;
    if (this.phase === "LOCKED") return this.snapshot();
    if (this.phase === "NEUTRAL" || this.gesture !== supported) {
      this.phase = "HOLDING";
      this.gesture = supported;
      this.startedAt = now;
      this.lastSeenAt = now;
      return this.snapshot();
    }

    const progress = Math.min(1, (now - this.startedAt) / GESTURE_HOLD_MS);
    if (progress < 1) return { ...this.snapshot(), progress };

    this.phase = "CONFIRMED";
    const confirmed = this.gesture;
    const snapshot = { ...this.snapshot(), progress: 1, confirmed };
    this.phase = "LOCKED";
    return snapshot;
  }

  private reset() {
    this.phase = "NEUTRAL";
    this.gesture = null;
    this.startedAt = 0;
    this.lastSeenAt = 0;
  }

  private snapshot(): GestureSnapshot {
    return {
      phase: this.phase,
      gesture: this.gesture,
      progress: 0,
      confirmed: null,
    };
  }
}
