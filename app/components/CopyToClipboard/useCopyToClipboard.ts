import { useEffect, useState } from "react";

const ERROR_MESSAGE =
  "Sorry, there was a problem copying. Please copy the text manually.";

export function useCopyToClipboard() {
  const [didCopy, setDidCopy] = useState(false);

  const handleCopyClick = async (text: string) => {
    if (!navigator.clipboard) {
      alert(ERROR_MESSAGE);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setDidCopy(true);
    } catch (_error) {
      console.warn("useCopyToClipboard error: ", _error);
      alert(ERROR_MESSAGE);
    }
  };

  useEffect(() => {
    if (didCopy) {
      setTimeout(() => {
        setDidCopy(false);
      }, 2000);
    }
  }, [didCopy]);

  return {
    didCopy,
    handleCopyClick,
  };
}
