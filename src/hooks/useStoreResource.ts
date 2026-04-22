import { useEffect, useState } from "react";

interface UseStoreResourceParams<TData> {
  hasData: boolean;
  fetcher: () => Promise<TData>;
  onData: (data: TData) => void;
  errorMessage: string;
}

export function useStoreResource<TData>({
  hasData,
  fetcher,
  onData,
  errorMessage,
}: UseStoreResourceParams<TData>) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasData) {
      return;
    }

    let cancelled = false;

    fetcher()
      .then((data) => {
        if (cancelled) {
          return;
        }
        onData(data);
      })
      .catch((value: unknown) => {
        if (cancelled) {
          return;
        }
        const message = value instanceof Error ? value.message : errorMessage;
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [errorMessage, fetcher, hasData, onData]);

  return {
    loading: !hasData && error === null,
    error,
  };
}
