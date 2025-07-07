import React, { useState, useRef } from 'react';
import { Autocomplete, TextField, AutocompleteProps, AutocompleteCloseReason, AutocompleteChangeReason } from '@mui/material';
import { useAutocompleteKeyboard } from 'hooks/useAutocompleteKeyboard';

interface EnhancedAutocompleteProps<T> extends Omit<AutocompleteProps<T, boolean, boolean, boolean>, 'renderInput'> {
  label: string;
  error?: boolean;
  helperText?: string;
  onNextField?: () => void;
  onPreviousField?: () => void;
  name?: string;
}

export const EnhancedAutocomplete = React.forwardRef(<T,>(props: EnhancedAutocompleteProps<T>, ref: React.Ref<HTMLDivElement>) => {
  const {
    label,
    error,
    helperText,
    onNextField,
    onPreviousField,
    name,
    onOpen,
    onClose,
    onChange,
    ...autocompleteProps
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedValue, setHighlightedValue] = useState<T | null>(null);

  const handleOpen = (event: React.SyntheticEvent) => {
    setIsOpen(true);
    onOpen?.(event);
  };

  const handleClose = (event: React.SyntheticEvent, reason: AutocompleteCloseReason) => {
    setIsOpen(false);
    setHighlightedValue(null);
    onClose?.(event, reason);
  };

  const handleHighlightChange = (event: React.SyntheticEvent, option: T | null, reason: string) => {
    setHighlightedValue(option);
  };

    const { handleKeyDown } = useAutocompleteKeyboard({
    isOpen,
    onSelect: (value: T) => {
      // For multiple selection, we need to handle this differently
      if (autocompleteProps.multiple) {
        // Get current value and add the new value
        const currentValue = Array.isArray(autocompleteProps.value) ? autocompleteProps.value as T[] : [];
        const isEqualValue = currentValue.some(v => autocompleteProps.isOptionEqualToValue?.(v, value));
        const newValue = isEqualValue ? currentValue.filter(v => !autocompleteProps.isOptionEqualToValue?.(v, value)) : [...currentValue, value];
        
        onChange?.({} as React.SyntheticEvent, newValue, isEqualValue ? 'removeOption' : 'selectOption');
      } else {
        // Single selection
        onChange?.({} as React.SyntheticEvent, value, 'selectOption');
      }
      handleClose({} as React.SyntheticEvent, 'selectOption');
    },
    onClose: () => handleClose({} as React.SyntheticEvent, 'escapeKeyDown' as AutocompleteCloseReason),
    onNextField,
    onPreviousField,
    highlightedValue,
  });

  return (
    <Autocomplete
      {...autocompleteProps}
      ref={ref}
      onOpen={handleOpen}
      onClose={handleClose}
      open={isOpen}
      onChange={onChange}
      onHighlightChange={handleHighlightChange}
      onKeyDown={handleKeyDown}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          error={error}
          helperText={helperText}
          autoFocus={autocompleteProps.autoFocus}
          onFocus={(e) => e.target.select()}
          name={name}
        />
      )}
    />
  );
}); 