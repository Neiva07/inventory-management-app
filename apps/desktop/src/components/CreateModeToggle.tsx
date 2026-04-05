import React from 'react';
import {
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/ui';

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex min-w-fit items-center gap-2">
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {isCreateMode ? createText : listingText}
            </span>
            <Switch
              checked={isCreateMode}
              onCheckedChange={onToggle}
              aria-label="Alternar modo de criação"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">Ctrl/Cmd + T</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 
