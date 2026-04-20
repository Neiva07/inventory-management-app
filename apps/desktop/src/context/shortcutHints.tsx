import React, { createContext, useContext } from 'react';
import { useModifierKeyHeld } from 'hooks/useModifierKeyHeld';

interface ShortcutHintsContextType {
  showShortcutHints: boolean;
}

const ShortcutHintsContext = createContext<ShortcutHintsContextType>({
  showShortcutHints: false,
});

export const ShortcutHintsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showShortcutHints = useModifierKeyHeld();

  return (
    <ShortcutHintsContext.Provider value={{ showShortcutHints }}>
      {children}
    </ShortcutHintsContext.Provider>
  );
};

/** Returns whether keyboard shortcut hint badges should be visible */
export const useShortcutHints = () => useContext(ShortcutHintsContext);
