import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from 'lib/utils';
import { useAutocompleteKeyboard } from 'hooks/useAutocompleteKeyboard';
import { Button } from 'components/ui/button';

export type AutocompleteCloseReason =
  | 'toggleInput'
  | 'escapeKeyDown'
  | 'selectOption'
  | 'blur';

export type AutocompleteChangeReason =
  | 'selectOption'
  | 'removeOption'
  | 'clear';

export interface AutocompleteProps<T> {
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

const DEFAULT_NO_OPTIONS_TEXT = 'Nenhuma opção encontrada';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const AutocompleteInner = <T,>(
  props: AutocompleteProps<T>,
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
    `combobox-listbox-${Math.random().toString(36).slice(2, 9)}`
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
      if (option == null) return '';
      if (getOptionLabel) return getOptionLabel(option) ?? '';
      return String(option);
    },
    [getOptionLabel]
  );

  const isEqual = useCallback(
    (option: T, compareValue: T) => {
      if (isOptionEqualToValue) return isOptionEqualToValue(option, compareValue);
      return Object.is(option, compareValue);
    },
    [isOptionEqualToValue]
  );

  const selectedValues = useMemo(() => {
    if (!multiple) return [];
    return Array.isArray(value) ? value : [];
  }, [multiple, value]);

  const selectedSingleValue = useMemo(() => {
    if (multiple) return null;
    return (Array.isArray(value) ? null : value) ?? null;
  }, [multiple, value]);

  const selectedSingleLabel = useMemo(
    () => getLabel(selectedSingleValue),
    [getLabel, selectedSingleValue]
  );

  useEffect(() => {
    if (multiple) {
      if (!isOpen) setInputValue('');
      return;
    }
    if (!isOpen) setInputValue(selectedSingleLabel);
  }, [isOpen, multiple, selectedSingleLabel]);

  const filteredOptions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return options;
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
      if (disabled || isOpenRef.current) return;
      isOpenRef.current = true;
      setIsOpen(true);
      onOpen?.(event);
    },
    [disabled, onOpen]
  );

  const closeList = useCallback(
    (reason: AutocompleteCloseReason, event: React.SyntheticEvent, nextInputValue?: string) => {
      if (!isOpenRef.current) return;
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
    if (!isOpen) return;
    if (filteredOptions.length === 0) { setHighlightedIndex(-1); return; }
    const valid = highlightedIndex >= 0 && highlightedIndex < filteredOptions.length;
    if (valid) return;
    if (!multiple && selectedSingleValue) {
      const idx = filteredOptions.findIndex((o) => isEqual(o, selectedSingleValue));
      setHighlightedIndex(idx >= 0 ? idx : 0);
      return;
    }
    setHighlightedIndex(0);
  }, [filteredOptions, highlightedIndex, isEqual, isOpen, multiple, selectedSingleValue]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current || rootRef.current.contains(event.target as Node)) return;
      closeList('blur', {} as React.SyntheticEvent);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeList, isOpen]);

  const emitChange = useCallback(
    (event: React.SyntheticEvent, nextValue: T | T[] | null, reason: AutocompleteChangeReason) => {
      onChange?.(event, nextValue, reason);
    },
    [onChange]
  );

  const selectOption = useCallback(
    (option: T, event: React.SyntheticEvent) => {
      if (multiple) {
        const alreadySelected = selectedValues.some((v) => isEqual(option, v));
        const nextValues = alreadySelected
          ? selectedValues.filter((v) => !isEqual(option, v))
          : [...selectedValues, option];
        emitChange(event, nextValues, alreadySelected ? 'removeOption' : 'selectOption');
        setInputValue('');
        setIsOpen(true);
        inputRef.current?.focus();
        return;
      }
      emitChange(event, option, 'selectOption');
      closeList('selectOption', event, getLabel(option));
    },
    [closeList, emitChange, getLabel, isEqual, multiple, selectedValues]
  );

  const { handleKeyDown: handleShortcutKeyDown } = useAutocompleteKeyboard<T>({
    isOpen,
    multiple,
    onSelect: (selectedOption: T) => selectOption(selectedOption, {} as React.SyntheticEvent),
    onClose: () => closeList('escapeKeyDown', {} as React.SyntheticEvent),
    onNextField,
    onPreviousField,
    highlightedValue: highlightedValue ?? undefined,
  });

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) openList(event);
      if (filteredOptions.length > 0) {
        setHighlightedIndex((prev) => prev < 0 ? 0 : clamp(prev + 1, 0, filteredOptions.length - 1));
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) openList(event);
      if (filteredOptions.length > 0) {
        setHighlightedIndex((prev) => prev < 0 ? filteredOptions.length - 1 : clamp(prev - 1, 0, filteredOptions.length - 1));
      }
      return;
    }

    if (multiple && event.key === 'Backspace' && !inputValue && selectedValues.length) {
      emitChange(event, selectedValues.slice(0, -1), 'removeOption');
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
      if (!rootRef.current || !rootRef.current.contains(document.activeElement)) {
        closeList('blur', {} as React.SyntheticEvent);
      }
    }, 0);
  };

  const activeDescendantId =
    highlightedIndex >= 0 ? `${listboxIdRef.current}-option-${highlightedIndex}` : undefined;

  // --- Multi-select with inline chips ---
  if (multiple) {
    return (
      <div ref={rootRef} className={cn('relative w-full', className)}>
        <label
          htmlFor={id}
          className={cn(
            'mb-3 block text-sm font-medium leading-snug',
            error ? 'text-destructive' : ''
          )}
        >
          {label}
        </label>

        {/* Chips container with inline input — matches shadcn ComboboxChips */}
        <div
          className={cn(
            'flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow]',
            'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
            error && 'border-destructive ring-destructive/20',
            disabled && 'cursor-not-allowed opacity-50',
            selectedValues.length > 0 && 'px-1.5',
            !error && 'border-input',
          )}
        >
          {renderTags
            ? renderTags(selectedValues)
            : selectedValues.map((item, i) => (
                <div
                  key={i}
                  className="flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground"
                >
                  {getLabel(item)}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="-ml-1 opacity-50 hover:opacity-100"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      const next = selectedValues.filter((v) => !isEqual(v, item));
                      emitChange(e, next, 'removeOption');
                    }}
                  >
                    <X className="pointer-events-none size-3" />
                  </Button>
                </div>
              ))
          }
          <input
            ref={inputRef}
            id={id}
            name={name}
            value={inputValue}
            autoFocus={autoFocus}
            disabled={disabled}
            placeholder={selectedValues.length === 0 ? placeholder : 'Buscar mais...'}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!isOpen) openList(e);
            }}
            onKeyDown={handleInputKeyDown}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxIdRef.current}
            aria-autocomplete="list"
            aria-activedescendant={activeDescendantId}
            aria-invalid={error}
            className="min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        {helperText && (
          <p className={cn('mt-1 text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
            {helperText}
          </p>
        )}

        {isOpen && renderDropdown(filteredOptions, highlightedIndex, multiple, selectedValues, selectedSingleValue, isEqual, getLabel, selectOption, setHighlightedIndex, listboxIdRef.current)}
      </div>
    );
  }

  // --- Single select with InputGroup ---
  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <label
        htmlFor={id}
        className={cn(
          'mb-3 block text-sm font-medium leading-snug',
          error ? 'text-destructive' : ''
        )}
      >
        {label}
      </label>

      {/* Input group — matches shadcn ComboboxInput */}
      <div
        className={cn(
          'group/input-group relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none',
          'h-9 min-w-0',
          'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          error && 'border-destructive ring-destructive/20',
          disabled && 'cursor-not-allowed opacity-50',
          !error && 'border-input',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          value={inputValue}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) openList(e);
          }}
          onKeyDown={handleInputKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxIdRef.current}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendantId}
          aria-invalid={error}
          className="h-full flex-1 rounded-md bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />

        {/* Clear + trigger buttons in addon area */}
        <div className="flex items-center pr-1">
          {selectedSingleValue && !disabled && (
            <Button
              variant="ghost"
              size="icon-xs"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                emitChange(e, null, 'clear');
                setInputValue('');
                inputRef.current?.focus();
              }}
            >
              <X className="pointer-events-none size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            tabIndex={-1}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(event) => {
              if (isOpen) {
                closeList('toggleInput', event);
              } else {
                inputRef.current?.focus();
                openList(event);
              }
            }}
            className={cn(selectedSingleValue && !disabled && 'hidden')}
          >
            <ChevronDown className={cn('size-4 text-muted-foreground', isOpen && 'rotate-180')} />
          </Button>
        </div>
      </div>

      {helperText && (
        <p className={cn('mt-1 text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {helperText}
        </p>
      )}

      {isOpen && renderDropdown(filteredOptions, highlightedIndex, multiple, selectedValues, selectedSingleValue, isEqual, getLabel, selectOption, setHighlightedIndex, listboxIdRef.current)}
    </div>
  );
};

/** Shared dropdown renderer for both single and multi-select */
function renderDropdown<T>(
  filteredOptions: T[],
  highlightedIndex: number,
  multiple: boolean,
  selectedValues: T[],
  selectedSingleValue: T | null,
  isEqual: (a: T, b: T) => boolean,
  getLabel: (option: T) => string,
  selectOption: (option: T, event: React.SyntheticEvent) => void,
  setHighlightedIndex: (index: number) => void,
  listboxId: string,
) {
  return (
    <div
      id={listboxId}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      className={cn(
        'absolute z-50 mt-1.5 max-h-64 w-full overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10',
        'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
      )}
    >
      <div className="max-h-64 scroll-py-1 overflow-y-auto p-1">
        {filteredOptions.length === 0 ? (
          <div className="flex w-full justify-center py-2 text-center text-sm text-muted-foreground">
            {DEFAULT_NO_OPTIONS_TEXT}
          </div>
        ) : (
          filteredOptions.map((option, index) => {
            const optionLabel = getLabel(option);
            const selected = multiple
              ? selectedValues.some((v) => isEqual(option, v))
              : !!selectedSingleValue && isEqual(option, selectedSingleValue);
            const highlighted = index === highlightedIndex;

            return (
              <button
                key={`${optionLabel}-${index}`}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={(event) => selectOption(option, event)}
                className={cn(
                  'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-left text-sm outline-hidden select-none',
                  highlighted && 'bg-accent text-accent-foreground',
                  !highlighted && 'hover:bg-accent/60',
                )}
              >
                <span className="truncate">{optionLabel}</span>
                {selected && (
                  <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <Check className="size-4" />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

type AutocompleteComponent = <T>(
  props: AutocompleteProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;

export const Autocomplete = React.forwardRef(
  AutocompleteInner
) as AutocompleteComponent;
