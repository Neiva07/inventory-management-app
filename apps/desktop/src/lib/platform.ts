export const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

/** Platform-aware modifier key label: "⌘" on macOS, "Ctrl" on Windows/Linux */
export const modKey = isMac ? '⌘' : 'Ctrl';
