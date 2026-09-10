import { useLayoutEffect, useRef } from 'react';

/** Long-lived animation callbacks read committed props without restarting their timeline. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
