import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/ui';
import { KeyboardListPageKeyboardHelp } from './KeyboardListPageKeyboardHelp';

interface ListPageKeyboardHelperIconProps {
  title?: string;
  showInactivate?: boolean;
  customShortcuts?: Array<{
    shortcut: string;
    description: string;
  }>;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ListPageKeyboardHelperIcon: React.FC<ListPageKeyboardHelperIconProps> = ({
  title = "Atalhos do Teclado",
  showInactivate = false,
  customShortcuts = [],
  size = 'medium',
  color = 'primary',
  open,
  onOpenChange,
}) => {
  const [internalShowHelp, setInternalShowHelp] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const showHelp = open !== undefined ? open : internalShowHelp;
  const setShowHelp = onOpenChange || setInternalShowHelp;

  const handleShowHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const sizeClass =
    size === 'small'
      ? 'h-8 w-8'
      : size === 'large'
        ? 'h-12 w-12'
        : 'h-10 w-10';
  const iconClass =
    size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-6 w-6' : 'h-5 w-5';
  const colorClass =
    color === 'secondary'
      ? 'text-secondary'
      : color === 'default'
        ? 'text-foreground'
        : 'text-primary';

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleShowHelp}
              variant="ghost"
              size="icon"
              className={`ml-1 ${sizeClass} ${colorClass}`}
              aria-label="Atalhos do Teclado (F1)"
            >
              <HelpCircle className={iconClass} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Atalhos do Teclado (F1)</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <KeyboardListPageKeyboardHelp
        open={showHelp}
        onClose={handleCloseHelp}
        title={title}
        showInactivate={showInactivate}
        customShortcuts={customShortcuts}
      />
    </>
  );
}; 
