export type NavigationMode = 'tab' | 'enter';

/** Returns true if the event is a "navigate to next field" key for the given mode. */
export function isNavForward(
  e: React.KeyboardEvent | KeyboardEvent,
  mode: NavigationMode,
): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  if (mode === 'tab') return e.key === 'Tab' && !e.shiftKey;
  return e.key === 'Enter' && !e.shiftKey;
}

/** Returns true if the event is a "navigate to previous field" key for the given mode. */
export function isNavBackward(
  e: React.KeyboardEvent | KeyboardEvent,
  mode: NavigationMode,
): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  if (mode === 'tab') return e.key === 'Tab' && e.shiftKey;
  return e.key === 'Enter' && e.shiftKey;
}
