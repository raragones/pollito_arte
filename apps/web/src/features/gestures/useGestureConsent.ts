import { useCallback, useEffect, useState } from "react";
import { gestureStorage, type GestureConsent } from "./storage";

export function useGestureConsent() {
  const [consent, setConsent] = useState<GestureConsent>(() =>
    gestureStorage.getConsent(),
  );
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => gestureStorage.subscribeConsent(setConsent), []);

  const activate = useCallback(async () => {
    setRequesting(true);
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera unavailable");
      }
      gestureStorage.setConsent("accepted");
      return true;
    } catch {
      gestureStorage.setConsent("declined");
      setError(
        "No fue posible activar la cámara. Puedes intentarlo más tarde.",
      );
      return false;
    } finally {
      setRequesting(false);
    }
  }, []);

  const decline = useCallback(() => gestureStorage.setConsent("declined"), []);
  return { consent, activate, decline, requesting, error };
}
