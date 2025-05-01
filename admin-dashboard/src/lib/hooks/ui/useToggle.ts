// src/lib/hooks/ui/useToggle.ts
import { useCallback, useState } from "react";

export const useToggle = (
  initial = false
): [boolean, () => void, (v: boolean) => void] => {
  const [state, setState] = useState(initial);
  const toggle = useCallback(() => setState((x) => !x), []);
  return [state, toggle, setState];
};
