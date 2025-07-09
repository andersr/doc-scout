import { useEffect, useState } from "react";

export function useClientLoaded() {
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  return clientLoaded;
}
