import React from 'react';
import { FormControlLabel, Switch, Typography, Box, Tooltip } from '@mui/material';

interface CreateModeToggleProps {
  isCreateMode: boolean;
  onToggle: (isCreateMode: boolean) => void;
  listingText: string;
  createText: string;
}

export const CreateModeToggle: React.FC<CreateModeToggleProps> = ({
  isCreateMode,
  onToggle,
  listingText,
  createText,
}) => {
  return (
    <Tooltip title="Ctrl/Cmd + T" placement="top">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 'fit-content' }}>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {isCreateMode ? createText : listingText}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isCreateMode}
              onChange={(e) => onToggle(e.target.checked)}
              size="medium"
            />
          }
          label=""
        />
      </Box>
    </Tooltip>
  );
}; 