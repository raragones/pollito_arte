import type {
  GestureRecognizer,
  GestureRecognizerResult,
} from "@mediapipe/tasks-vision";

const VERSION = "1.0.1";
const WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`;
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

export async function createGestureRecognizer(): Promise<GestureRecognizer> {
  const { FilesetResolver, GestureRecognizer } =
    await import("@mediapipe/tasks-vision");
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  return GestureRecognizer.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_PATH },
    runningMode: "VIDEO",
    numHands: 1,
  });
}

export function primaryGesture(result: GestureRecognizerResult) {
  const category = result.gestures[0]?.[0];
  return {
    name: category?.categoryName,
    confidence: category?.score ?? 0,
  };
}
