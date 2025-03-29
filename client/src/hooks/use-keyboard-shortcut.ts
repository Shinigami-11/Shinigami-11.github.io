import { useEffect } from "react";

type KeyboardShortcutOptions = {
  disabled?: boolean;
  preventDefault?: boolean;
};

/**
 * Hook for handling keyboard shortcuts
 * @param key Key or array of keys to listen for
 * @param callback Function to call when key is pressed
 * @param options Additional options
 */
export function useKeyboardShortcut(
  key: string | string[],
  callback: (e: KeyboardEvent) => void,
  options: KeyboardShortcutOptions = {}
) {
  const { disabled = false, preventDefault = true } = options;

  useEffect(() => {
    if (disabled) return;

    const handler = (e: KeyboardEvent) => {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.includes(e.key) || keys.includes(e.code)) {
        if (preventDefault) {
          e.preventDefault();
        }
        callback(e);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [key, callback, disabled, preventDefault]);
}
