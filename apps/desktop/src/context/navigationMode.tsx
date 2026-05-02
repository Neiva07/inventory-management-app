import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth';
import { useUI } from './ui';
import { getAppSettings, setAppSettings } from '../model/appSettings';
import type { NavigationMode } from '../lib/navigationKeys';

interface NavigationModeContextType {
  navigationMode: NavigationMode;
  setNavigationMode: (mode: NavigationMode) => void;
}

const NavigationModeContext = createContext<NavigationModeContextType>({
  navigationMode: 'tab',
  setNavigationMode: () => {},
});

/**
 * Selector that matches form inputs eligible for Enter-key navigation.
 * Excludes buttons, checkboxes, radios, and hidden fields.
 */
const FORM_INPUT_SELECTOR = [
  'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
].join(', ');

const TABBABLE_SELECTOR = [
  'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]):not([data-form-navigation="skip"])',
  'select:not([disabled]):not([tabindex="-1"]):not([data-form-navigation="skip"])',
  'textarea:not([disabled]):not([tabindex="-1"]):not([data-form-navigation="skip"])',
  'button:not([disabled]):not([tabindex="-1"]):not([data-form-navigation="skip"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled]):not([data-form-navigation="skip"])',
].join(', ');

function getVisibleTabbableElements(): HTMLElement[] {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  );
  return elements.filter((el) => {
    if (el.closest('[data-form-navigation="skip"]')) return false;
    if (el.offsetParent === null && el.style.position !== 'fixed') return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

export const NavigationModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { layout } = useUI();
  const [mode, setMode] = useState<NavigationMode>('tab');

  useEffect(() => {
    if (!user?.id) return;
    void getAppSettings(user.id).then((settings) => {
      if (settings?.navigationMode) {
        setMode(settings.navigationMode);
      }
    });
  }, [user?.id]);

  const setNavigationMode = useCallback(
    (newMode: NavigationMode) => {
      setMode(newMode);
      if (user) {
        void getAppSettings(user.id).then((existing) => {
          void setAppSettings({
            user_id: user.id,
            layout: existing?.layout ?? layout,
            theme: existing?.theme,
            language: existing?.language,
            timezone: existing?.timezone,
            navigationMode: newMode,
          });
        });
      }
    },
    [user, layout],
  );

  // Global Enter-key navigation for regular form inputs.
  // Specialized components (autocomplete, table) handle their own Enter
  // and call preventDefault() — the defaultPrevented check avoids double-handling.
  useEffect(() => {
    if (mode !== 'enter') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key !== 'Enter') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      if (!active.matches(FORM_INPUT_SELECTOR)) return;

      // Skip if inside an open dropdown/popover (autocomplete handles it)
      if (active.closest('[data-state="open"], [role="listbox"]')) return;

      e.preventDefault();

      const tabbable = getVisibleTabbableElements();
      const idx = tabbable.indexOf(active);
      if (idx === -1) return;

      if (e.shiftKey) {
        const prev = idx > 0 ? tabbable[idx - 1] : tabbable[tabbable.length - 1];
        prev.focus();
      } else {
        const next =
          idx < tabbable.length - 1 ? tabbable[idx + 1] : tabbable[0];
        next.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  return (
    <NavigationModeContext.Provider
      value={{ navigationMode: mode, setNavigationMode }}
    >
      {children}
    </NavigationModeContext.Provider>
  );
};

export const useNavigationMode = () => useContext(NavigationModeContext);
