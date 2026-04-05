import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Input } from 'components/ui';
import { cn } from 'lib/utils';
import { useAutocompleteKeyboard } from 'hooks/useAutocompleteKeyboard';

export type AutocompleteCloseReason =
  | 'toggleInput'
  | 'escapeKeyDown'
  | 'selectOption'
  | 'blur';

export type AutocompleteChangeReason =
  | 'selectOption'
  | 'removeOption'
  | 'clear';

interface EnhancedAutocompleteProps<T> {
  id?: string;
  name?: string;
  label: string;
  options: T[];
  value?: T | T[] | null;
  multiple?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  placeholder?: string;
  className?: string;
  getOptionLabel?: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  onChange?: (
    event: React.SyntheticEvent,
    value: T | T[] | null,
    reason?: AutocompleteChangeReason
  ) => void;
  onOpen?: (event: React.SyntheticEvent) => void;
  onClose?: (event: React.SyntheticEvent, reason: AutocompleteCloseReason) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onNextField?: () => void;
  onPreviousField?: () => void;
  renderTags?: (value: T[]) => React.ReactNode;
}

const DEFAULT_NO_OPTIONS_TEXT = 'Nenhuma opcao encontrada';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const EnhancedAutocompleteInner = <T,>(
  props: EnhancedAutocompleteProps<T>,
  ref: React.Ref<HTMLDivElement>
) => {
  const {
    id,
    name,
    label,
    options,
    value,
    multiple = false,
    disabled = false,
    autoFocus = false,
    error = false,
    helperText,
    placeholder,
    className,
    getOptionLabel,
    isOptionEqualToValue,
    onChange,
    onOpen,
    onClose,
    onBlur,
    onFocus,
    onNextField,
    onPreviousField,
    renderTags,
  } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxIdRef = useRef(
    `enhanced-autocomplete-listbox-${Math.random().toString(36).slice(2, 9)}`
  );
  const isOpenRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const getLabel = useCallback(
    (option: T | null | undefined) => {
      if (option == null) {
        return '';
      }

      if (getOptionLabel) {
        return getOptionLabel(option) ?? '';
      }

      return String(option);
    },
    [getOptionLabel]
  );

  const isEqual = useCallback(
    (option: T, compareValue: T) => {
      if (isOptionEqualToValue) {
        return isOptionEqualToValue(option, compareValue);
      }
      return Object.is(option, compareValue);
    },
    [isOptionEqualToValue]
  );

  const selectedValues = useMemo(() => {
    if (!multiple) {
      return [];
    }
    return Array.isArray(value) ? value : [];
  }, [multiple, value]);

  const selectedSingleValue = useMemo(() => {
    if (multiple) {
      return null;
    }
    return (Array.isArray(value) ? null : value) ?? null;
  }, [multiple, value]);

  const selectedSingleLabel = useMemo(
    () => getLabel(selectedSingleValue),
    [getLabel, selectedSingleValue]
  );

  useEffect(() => {
    if (multiple) {
      if (!isOpen) {
        setInputValue('');
      }
      return;
    }

    if (!isOpen) {
      setInputValue(selectedSingleLabel);
    }
  }, [isOpen, multiple, selectedSingleLabel]);

  const filteredOptions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter((option) =>
      getLabel(option).toLowerCase().includes(query)
    );
  }, [getLabel, inputValue, options]);

  const highlightedValue =
    highlightedIndex >= 0 && highlightedIndex < filteredOptions.length
      ? filteredOptions[highlightedIndex]
      : null;

  const openList = useCallback(
    (event: React.SyntheticEvent) => {
      if (disabled || isOpenRef.current) {
        return;
      }
      isOpenRef.current = true;
      setIsOpen(true);
      onOpen?.(event);
    },
    [disabled, onOpen]
  );

  const closeList = useCallback(
    (
      reason: AutocompleteCloseReason,
      event: React.SyntheticEvent,
      nextInputValue?: string
    ) => {
      if (!isOpenRef.current) {
        return;
      }

      isOpenRef.current = false;
      setIsOpen(false);
      setHighlightedIndex(-1);
      if (typeof nextInputValue === 'string') {
        setInputValue(nextInputValue);
      } else if (multiple) {
        setInputValue('');
      } else {
        setInputValue(selectedSingleLabel);
      }
      onClose?.(event, reason);
    },
    [multiple, onClose, selectedSingleLabel]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (filteredOptions.length === 0) {
      setHighlightedIndex(-1);
      return;
    }

    const currentHighlightedValid =
      highlightedIndex >= 0 && highlightedIndex < filteredOptions.length;

    if (currentHighlightedValid) {
      return;
    }

    if (!multiple && selectedSingleValue) {
      const selectedIndex = filteredOptions.findIndex((option) =>
        isEqual(option, selectedSingleValue)
      );
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      return;
    }

    setHighlightedIndex(0);
  }, [
    filteredOptions,
    highlightedIndex,
    isEqual,
    isOpen,
    multiple,
    selectedSingleValue,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (rootRef.current.contains(event.target as Node)) {
        return;
      }

      closeList('blur', {} as React.SyntheticEvent);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [closeList, isOpen]);

  const emitChange = useCallback(
    (
      event: React.SyntheticEvent,
      nextValue: T | T[] | null,
      reason: AutocompleteChangeReason
    ) => {
      onChange?.(event, nextValue, reason);
    },
    [onChange]
  );

  const selectOption = useCallback(
    (option: T, event: React.SyntheticEvent) => {
      if (multiple) {
        const currentValues = selectedValues;
        const alreadySelected = currentValues.some((valueItem) =>
          isEqual(option, valueItem)
        );
        const nextValues = alreadySelected
          ? currentValues.filter((valueItem) => !isEqual(option, valueItem))
          : [...currentValues, option];

        emitChange(
          event,
          nextValues,
          alreadySelected ? 'removeOption' : 'selectOption'
        );
        setInputValue('');
        setIsOpen(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
        return;
      }

      emitChange(event, option, 'selectOption');
      closeList('selectOption', event, getLabel(option));
    },
    [closeList, emitChange, getLabel, isEqual, multiple, selectedValues]
  );

  const { handleKeyDown: handleShortcutKeyDown } = useAutocompleteKeyboard<T>({
    isOpen,
    onSelect: (selectedOption: T) => {
      selectOption(selectedOption, {} as React.SyntheticEvent);
    },
    onClose: () => {
      closeList('escapeKeyDown', {} as React.SyntheticEvent);
    },
    onNextField,
    onPreviousField,
    highlightedValue: highlightedValue ?? undefined,
  });

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!isOpen) {
        openList(event);
      }

      if (filteredOptions.length > 0) {
        setHighlightedIndex((prev) => {
          if (prev < 0) {
            return 0;
          }
          return clamp(prev + 1, 0, filteredOptions.length - 1);
        });
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (!isOpen) {
        openList(event);
      }

      if (filteredOptions.length > 0) {
        setHighlightedIndex((prev) => {
          if (prev < 0) {
            return filteredOptions.length - 1;
          }
          return clamp(prev - 1, 0, filteredOptions.length - 1);
        });
      }
      return;
    }

    if (multiple && event.key === 'Backspace' && !inputValue && selectedValues.length) {
      const nextValues = selectedValues.slice(0, -1);
      emitChange(event, nextValues, 'removeOption');
      return;
    }

    handleShortcutKeyDown(event);
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
    openList(event);
    onFocus?.(event);
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);

    window.setTimeout(() => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      if (!root.contains(document.activeElement)) {
        closeList('blur', {} as React.SyntheticEvent);
      }
    }, 0);
  };

  const handleRootFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.target === rootRef.current && !disabled) {
      inputRef.current?.focus();
    }
  };

  const activeDescendantId =
    highlightedIndex >= 0
      ? `${listboxIdRef.current}-option-${highlightedIndex}`
      : undefined;

  const renderSelectedSummary = () => {
    if (!multiple || selectedValues.length === 0) {
      return null;
    }

    return (
      <div className="mb-2 rounded-md border bg-muted/30 px-2 py-1 text-xs text-foreground">
        {renderTags
          ? renderTags(selectedValues)
          : selectedValues.map((item) => getLabel(item)).join(', ')}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={cn('relative w-full', className)}
      tabIndex={-1}
      onFocus={handleRootFocus}
    >
      <label
        htmlFor={id}
        className={cn(
          'mb-1 block text-sm font-medium',
          error ? 'text-destructive' : 'text-foreground'
        )}
      >
        {label}
      </label>

      {renderSelectedSummary()}

      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          value={inputValue}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={
            placeholder ??
            (multiple && selectedValues.length > 0
              ? 'Digite para buscar mais opcoes'
              : undefined)
          }
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChange={(event) => {
            setInputValue(event.target.value);
            if (!isOpen) {
              openList(event);
            }
          }}
          onKeyDown={handleInputKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxIdRef.current}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendantId}
          aria-invalid={error}
          className={cn(
            'pr-9',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={(event) => {
            if (isOpen) {
              closeList('toggleInput', event);
            } else {
              inputRef.current?.focus();
              openList(event);
            }
          }}
          className="absolute inset-y-0 right-0 inline-flex w-9 items-center justify-center text-muted-foreground"
          aria-label={isOpen ? 'Fechar lista' : 'Abrir lista'}
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          />
        </button>
      </div>

      {helperText && (
        <p
          className={cn(
            'mt-1 text-xs',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {helperText}
        </p>
      )}

      {isOpen && (
        <div
          id={listboxIdRef.current}
          role="listbox"
          aria-multiselectable={multiple || undefined}
          className="absolute z-[1100] mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-2 text-sm text-muted-foreground">
              {DEFAULT_NO_OPTIONS_TEXT}
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const optionLabel = getLabel(option);
              const selected = multiple
                ? selectedValues.some((valueItem) => isEqual(option, valueItem))
                : !!selectedSingleValue && isEqual(option, selectedSingleValue);
              const highlighted = index === highlightedIndex;

              return (
                <button
                  key={`${optionLabel}-${index}`}
                  id={`${listboxIdRef.current}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onMouseEnter={() => {
                    setHighlightedIndex(index);
                  }}
                  onClick={(event) => {
                    selectOption(option, event);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm',
                    highlighted && 'bg-accent text-accent-foreground',
                    !highlighted && 'hover:bg-accent/60'
                  )}
                >
                  <span className="truncate">{optionLabel}</span>
                  {selected && <Check className="ml-2 h-4 w-4 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

type EnhancedAutocompleteComponent = <T>(
  props: EnhancedAutocompleteProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;

export const EnhancedAutocomplete = React.forwardRef(
  EnhancedAutocompleteInner
) as EnhancedAutocompleteComponent;
