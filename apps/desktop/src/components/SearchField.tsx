import React from 'react';
import { Search } from 'lucide-react';
import { Input } from 'components/ui/input';

interface SearchFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  fullWidth?: boolean;
  autoFocus?: boolean;
}

export const SearchField = React.forwardRef<HTMLDivElement, SearchFieldProps>(
  ({ value, onChange, placeholder, fullWidth = true, autoFocus = false }, ref) => {
    return (
      <div ref={ref} className={fullWidth ? 'w-full' : undefined}>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="pl-9"
            autoFocus={autoFocus}
          />
        </div>
      </div>
    );
  }
);

SearchField.displayName = 'SearchField';
