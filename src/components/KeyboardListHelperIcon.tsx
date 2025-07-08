import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
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

  return (
    <>
      <Tooltip title="Atalhos do Teclado (F1)" placement="top">
        <IconButton
          onClick={handleShowHelp}
          size={size}
          color={color}
          sx={{ ml: 1 }}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>

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