import * as React from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from 'lib/utils';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Calendar } from 'components/ui/calendar';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from 'components/ui/popover';

export interface DatePickerFieldProps {
  id?: string;
  label?: React.ReactNode;
  value: Date | null | undefined;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  helperText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  inputClassName?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export const DatePickerField = React.forwardRef<HTMLDivElement, DatePickerFieldProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      placeholder = 'Selecione uma data',
      helperText,
      error = false,
      disabled = false,
      allowClear = false,
      className,
      inputClassName,
      inputRef,
      onFocus,
      onBlur,
      onKeyDown,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const displayValue = React.useMemo(() => {
      if (!value) {
        return '';
      }

      try {
        return format(value, 'dd/MM/yyyy');
      } catch {
        return '';
      }
    }, [value]);

    const helperTextId = helperText && id ? `${id}-helper-text` : undefined;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled) {
        return;
      }

      if ((event.key === 'Backspace' || event.key === 'Delete') && allowClear && value) {
        event.preventDefault();
        onChange(null);
        return;
      }

      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    return (
      <div ref={ref} className={cn('w-full space-y-1', className)}>
        {label && (
          <label
            htmlFor={id}
            className={cn('block text-sm font-medium', error && 'text-destructive')}
          >
            {label}
          </label>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div className="relative">
              <Input
                id={id}
                ref={inputRef}
                readOnly
                disabled={disabled}
                value={displayValue}
                placeholder={placeholder}
                aria-invalid={error || undefined}
                aria-describedby={helperTextId}
                onClick={() => {
                  if (!disabled) {
                    setOpen(true);
                  }
                }}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                className={cn(
                  'cursor-pointer pr-9',
                  !displayValue && 'text-muted-foreground',
                  error && 'border-destructive focus-visible:ring-destructive/30',
                  inputClassName
                )}
              />
              <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </PopoverAnchor>

          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={(nextDate) => {
                if (nextDate) {
                  onChange(nextDate);
                  setOpen(false);
                }
              }}
              locale={ptBR as unknown as React.ComponentProps<typeof Calendar>['locale']}
              initialFocus
            />
            {allowClear && value && (
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  Limpar data
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {helperText ? (
          <p
            id={helperTextId}
            className={cn(
              'text-xs',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

DatePickerField.displayName = 'DatePickerField';
