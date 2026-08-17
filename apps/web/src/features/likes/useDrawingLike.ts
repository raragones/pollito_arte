import { useCallback, useState } from "react";
import { api } from "../../services/api";
import { gestureStorage } from "../gestures/storage";

export function useDrawingLike(id: string, initialCount: number) {
  const [liked, setLiked] = useState(() => gestureStorage.isDrawingLiked(id));
  const [likesCount, setLikesCount] = useState(initialCount);
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState("");

  const like = useCallback(async () => {
    if (liked || liking) return false;
    setLiking(true);
    setError("");
    try {
      const result = await api.likeDrawing(id);
      gestureStorage.markDrawingLiked(id);
      setLiked(true);
      setLikesCount(result.likesCount);
      return true;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo guardar tu like.",
      );
      return false;
    } finally {
      setLiking(false);
    }
  }, [id, liked, liking]);

  return { liked, likesCount, liking, error, like };
}
