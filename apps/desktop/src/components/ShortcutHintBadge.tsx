import React from 'react';
import { cn } from 'lib/utils';
import { modKey } from 'lib/platform';

type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';

interface ShortcutHintBadgeProps {
  /** The key part of the shortcut (e.g. "E", "2", "←"). The modifier (⌘/Ctrl) is prepended automatically. */
  shortcutKey: string;
  position?: BadgePosition;
  className?: string;
}

const positionClasses: Record<BadgePosition, string> = {
  'top-right': '-top-2 -right-2',
  'top-left': '-top-2 -left-2',
  'bottom-right': '-bottom-2 -right-2',
  'bottom-left': '-bottom-2 -left-2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

/** Small badge overlay showing a full keyboard shortcut (e.g. "⌘E" or "Ctrl+E") */
export const ShortcutHintBadge: React.FC<ShortcutHintBadgeProps> = ({
  shortcutKey,
  position = 'top-right',
  className,
}) => {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-50 whitespace-nowrap',
        'rounded bg-primary px-1.5 py-0.5',
        'font-mono text-[10px] font-bold leading-none text-primary-foreground',
        'shadow-lg ring-1 ring-primary-foreground/20',
        'animate-in fade-in-0 zoom-in-90 duration-150',
        positionClasses[position],
        className,
      )}
    >
      {modKey}+{shortcutKey}
    </span>
  );
};
