import { useEffect, useRef, useState } from 'react';
import { isMac } from 'lib/platform';

const HOLD_DELAY_MS = 300;
const MODIFIER_KEY = isMac ? 'Meta' : 'Control';

/**
 * Detects when the platform modifier key (Cmd on macOS, Ctrl on Windows/Linux)
 * is held for a sustained period without pressing any other key.
 * Returns true only after the key is held for HOLD_DELAY_MS continuously.
 * Pressing any other key while holding the modifier cancels the detection.
 */
export function useModifierKeyHeld(): boolean {
  const [showHints, setShowHints] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modifierDownRef = useRef(false);
  const otherKeyPressedRef = useRef(false);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === MODIFIER_KEY) {
        if (modifierDownRef.current) return; // Already tracking
        modifierDownRef.current = true;
        otherKeyPressedRef.current = false;

        clearTimer();
        timerRef.current = setTimeout(() => {
          if (modifierDownRef.current && !otherKeyPressedRef.current) {
            setShowHints(true);
          }
        }, HOLD_DELAY_MS);
        return;
      }

      // Any non-modifier key pressed while modifier is held = cancel
      if (modifierDownRef.current) {
        otherKeyPressedRef.current = true;
        clearTimer();
        setShowHints(false);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === MODIFIER_KEY) {
        modifierDownRef.current = false;
        otherKeyPressedRef.current = false;
        clearTimer();
        setShowHints(false);
      }
    };

    const handleBlur = () => {
      modifierDownRef.current = false;
      otherKeyPressedRef.current = false;
      clearTimer();
      setShowHints(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      clearTimer();
    };
  }, []);

  return showHints;
}
