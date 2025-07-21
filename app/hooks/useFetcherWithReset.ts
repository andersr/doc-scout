import { useEffect, useState } from "react";
import { type FetcherWithComponents, useFetcher } from "react-router";
import type { ActionData } from "~/types/actionData";

// src: https://github.com/remix-run/remix/discussions/2749#discussioncomment-7276763

type FetcherWithComponentsReset<T> = FetcherWithComponents<T> & {
  reset: () => void;
};

export function useFetcherWithReset<
  T = ActionData,
>(): FetcherWithComponentsReset<T> {
  const fetcher = useFetcher<T>();
  const [data, setData] = useState(fetcher.data);
  useEffect(() => {
    if (fetcher.state === "idle") {
      setData(fetcher.data);
    }
  }, [fetcher.state, fetcher.data]);
  return {
    ...fetcher,
    data: data as T,
    reset: () => setData(undefined),
  };
}
