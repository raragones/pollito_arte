export type GestureConsent = "accepted" | "declined" | "unknown";

const CONSENT_KEY = "natyarte:gesture-consent";
const LIKE_PREFIX = "natyarte:drawing-liked:";
const CONSENT_EVENT = "natyarte:gesture-consent-change";

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The experience still works when storage is unavailable.
  }
}

export const gestureStorage = {
  getConsent(): GestureConsent {
    const value = read(CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : "unknown";
  },
  setConsent(value: Exclude<GestureConsent, "unknown">) {
    write(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  },
  subscribeConsent(listener: (value: GestureConsent) => void) {
    const handle = (event: Event) =>
      listener((event as CustomEvent<GestureConsent>).detail);
    window.addEventListener(CONSENT_EVENT, handle);
    return () => window.removeEventListener(CONSENT_EVENT, handle);
  },
  isDrawingLiked(id: string) {
    return read(`${LIKE_PREFIX}${id}`) === "true";
  },
  markDrawingLiked(id: string) {
    write(`${LIKE_PREFIX}${id}`, "true");
  },
};
