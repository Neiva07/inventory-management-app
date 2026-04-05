import React from 'react';
import { ListPageKeyboardHelperIcon } from './KeyboardListHelperIcon';

interface PageTitleProps {
  children: React.ReactNode;
  showKeyboardHelp?: boolean;
  keyboardHelpTitle?: string;
  showInactivate?: boolean;
  customShortcuts?: Array<{
    shortcut: string;
    description: string;
  }>;
  helpOpen?: boolean;
  onHelpOpenChange?: (open: boolean) => void;
}

export const PageTitle: React.FC<PageTitleProps> = ({ 
  children, 
  showKeyboardHelp = false,
  keyboardHelpTitle,
  showInactivate = false,
  customShortcuts = [],
  helpOpen,
  onHelpOpenChange,
}) => (
  <div className="mb-3 flex items-center">
    <div className="mr-2 h-9 w-1.5 rounded-md bg-primary" />
    <h2
      className="text-2xl font-semibold tracking-tight text-primary"
      style={{
        fontFamily: '"Montserrat", "Inter", "Segoe UI", Arial, sans-serif',
        letterSpacing: '-0.5px',
        textShadow: '0 2px 8px rgba(26,35,126,0.04)',
      }}
    >
      {children}
    </h2>
    {showKeyboardHelp && (
      <ListPageKeyboardHelperIcon
        title={keyboardHelpTitle}
        showInactivate={showInactivate}
        customShortcuts={customShortcuts}
        open={helpOpen}
        onOpenChange={onHelpOpenChange}
      />
    )}
  </div>
); 
