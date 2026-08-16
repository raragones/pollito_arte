import { useEffect, useState } from "react";
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loader()
      .then((v) => active && setData(v))
      .catch(
        (e) =>
          active &&
          setError(e instanceof Error ? e.message : "Error inesperado"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, deps);
  return { data, loading, error };
}
