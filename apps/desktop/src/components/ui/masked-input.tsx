import * as React from "react";
import { Input } from "components/ui/input";

type InputProps = React.ComponentProps<"input">;

function applyDigitMask(value: string | null | undefined, mask: string) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";

  let output = "";
  let digitIndex = 0;

  for (const char of mask) {
    if (char === "9") {
      if (digitIndex >= digits.length) break;
      output += digits[digitIndex++];
      continue;
    }

    if (digitIndex >= digits.length && output.length === 0) break;
    output += char;
  }

  return output;
}

type MaskedInputProps = Omit<InputProps, "onChange" | "value"> & {
  mask: string;
  value?: string | null;
  onChange?: (value: string) => void;
};

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        value={applyDigitMask(value, mask)}
        onChange={(event) => {
          onChange?.(applyDigitMask(event.target.value, mask));
        }}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export { MaskedInput, applyDigitMask };
export type { MaskedInputProps };
