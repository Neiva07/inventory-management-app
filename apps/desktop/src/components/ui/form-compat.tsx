import * as React from "react";

import { cn } from "lib/utils";
import {
  Badge as ShadcnBadge,
  Button as ShadcnButton,
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  Input,
  Switch as ShadcnSwitch,
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
  Textarea,
} from "components/ui";
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";

type SxProps = Record<string, unknown> | undefined;

const SPACING_UNIT = 8;

const GRID_COL_SPAN: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

const GRID_MD_COL_SPAN: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

const GRID_SM_COL_SPAN: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
  9: "sm:col-span-9",
  10: "sm:col-span-10",
  11: "sm:col-span-11",
  12: "sm:col-span-12",
};

const GRID_LG_COL_SPAN: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

function toPx(value: unknown, allowNegative = true): string | number | undefined {
  if (typeof value === "number") {
    if (!allowNegative && value < 0) return 0;
    return `${value * SPACING_UNIT}px`;
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function resolveColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  switch (value) {
    case "primary":
    case "primary.main":
      return "var(--color-primary)";
    case "secondary":
    case "secondary.main":
      return "hsl(var(--secondary-foreground))";
    case "info.main":
      return "#2563eb";
    case "success.main":
      return "#059669";
    case "warning.main":
      return "#d97706";
    case "error.main":
      return "#dc2626";
    case "error.light":
      return "#fecaca";
    case "divider":
      return "hsl(var(--border))";
    case "grey.50":
      return "#f8fafc";
    case "text.secondary":
      return "hsl(var(--muted-foreground))";
    default:
      return value;
  }
}

function sxToStyle(sx: SxProps): React.CSSProperties {
  if (!sx) return {};

  const style: React.CSSProperties = {};
  const record = sx as Record<string, unknown>;

  if (record.position) style.position = record.position as React.CSSProperties["position"];
  if (record.display) style.display = record.display as React.CSSProperties["display"];
  if (record.flexDirection) style.flexDirection = record.flexDirection as React.CSSProperties["flexDirection"];
  if (record.alignItems) style.alignItems = record.alignItems as React.CSSProperties["alignItems"];
  if (record.justifyContent) style.justifyContent = record.justifyContent as React.CSSProperties["justifyContent"];
  if (record.flexWrap) style.flexWrap = record.flexWrap as React.CSSProperties["flexWrap"];
  if (record.gap !== undefined) style.gap = toPx(record.gap);
  if (record.flex !== undefined) style.flex = record.flex as React.CSSProperties["flex"];
  if (record.width !== undefined) style.width = record.width as React.CSSProperties["width"];
  if (record.height !== undefined) style.height = record.height as React.CSSProperties["height"];
  if (record.maxWidth !== undefined) style.maxWidth = record.maxWidth as React.CSSProperties["maxWidth"];
  if (record.minHeight !== undefined) style.minHeight = record.minHeight as React.CSSProperties["minHeight"];
  if (record.maxHeight !== undefined) style.maxHeight = record.maxHeight as React.CSSProperties["maxHeight"];
  if (record.minWidth !== undefined) style.minWidth = record.minWidth as React.CSSProperties["minWidth"];
  if (record.overflow !== undefined) style.overflow = record.overflow as React.CSSProperties["overflow"];
  if (record.overflowX !== undefined) style.overflowX = record.overflowX as React.CSSProperties["overflowX"];
  if (record.overflowY !== undefined) style.overflowY = record.overflowY as React.CSSProperties["overflowY"];
  if (record.color !== undefined) style.color = resolveColor(record.color);
  if (record.fontWeight !== undefined) style.fontWeight = record.fontWeight as React.CSSProperties["fontWeight"];
  if (record.flexGrow !== undefined) style.flexGrow = record.flexGrow as React.CSSProperties["flexGrow"];
  if (record.borderRadius !== undefined) style.borderRadius = toPx(record.borderRadius, false) as React.CSSProperties["borderRadius"];
  if (record.boxShadow !== undefined) style.boxShadow = record.boxShadow as React.CSSProperties["boxShadow"];
  if (record.borderBottom !== undefined) {
    style.borderBottom =
      typeof record.borderBottom === "number"
        ? `${record.borderBottom}px solid`
        : (record.borderBottom as React.CSSProperties["borderBottom"]);
  }
  if (record.border !== undefined) {
    style.border =
      typeof record.border === "number"
        ? `${record.border}px solid`
        : (record.border as React.CSSProperties["border"]);
  }
  if (record.borderColor !== undefined) style.borderColor = resolveColor(record.borderColor);
  if (record.opacity !== undefined) style.opacity = record.opacity as React.CSSProperties["opacity"];
  if (record.textAlign !== undefined) style.textAlign = record.textAlign as React.CSSProperties["textAlign"];
  if (record.lineHeight !== undefined) style.lineHeight = record.lineHeight as React.CSSProperties["lineHeight"];
  if (record.transition !== undefined) style.transition = record.transition as React.CSSProperties["transition"];
  if (record.transform !== undefined) style.transform = record.transform as React.CSSProperties["transform"];
  if (record.backgroundColor !== undefined) {
    style.backgroundColor = resolveColor(record.backgroundColor) ?? (record.backgroundColor as string);
  }
  if (record.bgcolor !== undefined) {
    style.backgroundColor = resolveColor(record.bgcolor) ?? (record.bgcolor as string);
  }

  if (record.p !== undefined) style.padding = toPx(record.p, false);
  if (record.px !== undefined) style.paddingInline = toPx(record.px, false);
  if (record.py !== undefined) style.paddingBlock = toPx(record.py, false);
  if (record.pt !== undefined) style.paddingTop = toPx(record.pt, false);
  if (record.pb !== undefined) style.paddingBottom = toPx(record.pb, false);
  if (record.pl !== undefined) style.paddingLeft = toPx(record.pl, false);
  if (record.pr !== undefined) style.paddingRight = toPx(record.pr, false);

  if (record.m !== undefined) style.margin = toPx(record.m);
  if (record.mx !== undefined) style.marginInline = toPx(record.mx);
  if (record.my !== undefined) style.marginBlock = toPx(record.my);
  if (record.mt !== undefined) style.marginTop = toPx(record.mt);
  if (record.mb !== undefined) style.marginBottom = toPx(record.mb);
  if (record.ml !== undefined) style.marginLeft = toPx(record.ml);
  if (record.mr !== undefined) style.marginRight = toPx(record.mr);

  // Ignore nested selectors like "&:hover" in compat mode.
  return style;
}

type BoxProps = React.HTMLAttributes<HTMLElement> & {
  component?: keyof React.JSX.IntrinsicElements;
  sx?: SxProps;
  display?: React.CSSProperties["display"];
  alignItems?: React.CSSProperties["alignItems"];
  justifyContent?: React.CSSProperties["justifyContent"];
  flexDirection?: React.CSSProperties["flexDirection"];
  flexWrap?: React.CSSProperties["flexWrap"];
  gap?: React.CSSProperties["gap"];
  minHeight?: React.CSSProperties["minHeight"];
  maxHeight?: React.CSSProperties["maxHeight"];
  flexGrow?: React.CSSProperties["flexGrow"];
  mt?: string | number;
  mb?: string | number;
  ml?: string | number;
  mr?: string | number;
  mx?: string | number;
  my?: string | number;
  p?: string | number;
  pt?: string | number;
  pb?: string | number;
  pl?: string | number;
  pr?: string | number;
  px?: string | number;
  py?: string | number;
};

export const Box = React.forwardRef<HTMLElement, BoxProps>(
  (
    {
      component = "div",
      sx,
      style,
      className,
      display,
      alignItems,
      justifyContent,
      flexDirection,
      flexWrap,
      gap,
      minHeight,
      maxHeight,
      flexGrow,
      mt,
      mb,
      ml,
      mr,
      mx,
      my,
      p,
      pt,
      pb,
      pl,
      pr,
      px,
      py,
      ...props
    },
    ref
  ) => {
    const Comp = component as React.ElementType;
    const inlineCompatSx: Record<string, unknown> = {
      display,
      alignItems,
      justifyContent,
      flexDirection,
      flexWrap,
      gap,
      minHeight,
      maxHeight,
      flexGrow,
      mt,
      mb,
      ml,
      mr,
      mx,
      my,
      p,
      pt,
      pb,
      pl,
      pr,
      px,
      py,
    };

    return (
      <Comp
        ref={ref}
        className={className}
        style={{ ...sxToStyle(inlineCompatSx), ...sxToStyle(sx), ...style }}
        {...props}
      />
    );
  }
);

Box.displayName = "Box";

type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  container?: boolean;
  item?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  spacing?: number;
  sx?: SxProps;
  alignItems?: React.CSSProperties["alignItems"];
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      container,
      item,
      xs = 12,
      sm,
      md,
      lg,
      spacing,
      sx,
      alignItems,
      style,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      container && "grid grid-cols-12",
      item && GRID_COL_SPAN[xs || 12],
      item && sm ? GRID_SM_COL_SPAN[sm] : undefined,
      item && md ? GRID_MD_COL_SPAN[md] : undefined,
      item && lg ? GRID_LG_COL_SPAN[lg] : undefined,
      className
    );

    return (
      <div
        ref={ref}
        className={classes}
        style={{
          ...(container && spacing !== undefined ? { gap: `${spacing * SPACING_UNIT}px` } : null),
          ...(alignItems ? { alignItems } : null),
          ...sxToStyle(sx),
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

type FormControlProps = React.HTMLAttributes<HTMLDivElement> & {
  fullWidth?: boolean;
  size?: "small" | "medium";
  sx?: SxProps;
};

export function FormControl({ fullWidth, className, size: _size, sx, style, ...props }: FormControlProps) {
  return <div className={cn(fullWidth && "w-full", className)} style={{ ...sxToStyle(sx), ...style }} {...props} />;
}

type TextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
  variant?: "outlined" | "filled" | "standard";
  multiline?: boolean;
  rows?: number;
  InputProps?: {
    readOnly?: boolean;
  };
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  size?: "small" | "medium";
};

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth,
      variant: _variant,
      multiline,
      rows,
      InputProps,
      inputProps,
      size: _size,
      className,
      id,
      style,
      required,
      ...props
    },
    ref
  ) => {
    const helperId = helperText && id ? `${id}-helper-text` : undefined;
      const commonProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & {
        className: string;
      } = {
        id,
        "aria-invalid": error || undefined,
        "aria-describedby": helperId,
        className: cn(
          error && "border-destructive focus-visible:ring-destructive/30",
          className
        ),
        required,
        ...inputProps,
        ...props,
      };

    return (
      <div className={cn("space-y-1", fullWidth && "w-full")} style={style}>
        {label ? (
          <label
            htmlFor={id}
            className={cn("block text-sm font-medium", error && "text-destructive")}
          >
            {label}
            {required ? <span className="ml-1 text-destructive">*</span> : null}
          </label>
        ) : null}
        {multiline ? (
          <Textarea
            {...(commonProps as unknown as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            ref={ref as unknown as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            readOnly={InputProps?.readOnly}
          />
        ) : (
          <Input
            {...commonProps}
            ref={ref}
            readOnly={InputProps?.readOnly}
          />
        )}
        {helperText ? (
          <p
            id={helperId}
            className={cn(
              "text-xs",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = "TextField";

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

type MaskedTextFieldProps = Omit<TextFieldProps, "onChange" | "value"> & {
  mask: string;
  value?: string | null;
  onChange?: (value: string) => void;
};

export const MaskedTextField = React.forwardRef<HTMLInputElement, MaskedTextFieldProps>(
  ({ mask, value, onChange, ...props }, ref) => {
    return (
      <TextField
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

MaskedTextField.displayName = "MaskedTextField";

type TypographyProps = React.HTMLAttributes<HTMLElement> & {
  component?: keyof React.JSX.IntrinsicElements;
  variant?: "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body2" | "body1" | "caption";
  gutterBottom?: boolean;
  paragraph?: boolean;
  align?: "inherit" | "left" | "center" | "right" | "justify";
  color?: string;
  sx?: SxProps;
  fontWeight?: React.CSSProperties["fontWeight"];
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      component,
      variant = "body1",
      gutterBottom,
      paragraph,
      align,
      color,
      sx,
      fontWeight,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const defaultComponent: Record<string, keyof React.JSX.IntrinsicElements> = {
      h4: "h1",
      h5: "h2",
      h6: "h3",
      subtitle1: "p",
      subtitle2: "p",
      body1: "p",
      body2: "p",
      caption: "span",
    };
    const Comp = (component ?? defaultComponent[variant] ?? "p") as React.ElementType;
    const variantClasses: Record<string, string> = {
      h4: "text-3xl font-semibold",
      h5: "text-2xl font-semibold",
      h6: "text-xl font-semibold",
      subtitle1: "text-base font-medium",
      subtitle2: "text-sm font-medium",
      body1: "text-base",
      body2: "text-sm",
      caption: "text-xs",
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          variantClasses[variant],
          gutterBottom && "mb-2",
          paragraph && "mb-4",
          align === "center" && "text-center",
          align === "right" && "text-right",
          align === "left" && "text-left",
          className
        )}
        style={{
          color: resolveColor(color),
          fontWeight,
          ...sxToStyle(sx),
          ...style,
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Typography.displayName = "Typography";

type ButtonVariant = "contained" | "outlined" | "text";
type ButtonSize = "small" | "medium" | "large";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: React.ReactNode;
  sx?: SxProps;
  fullWidth?: boolean;
  color?: "primary" | "secondary" | "error" | "warning" | "success";
  component?: "button" | "label";
};

function mapButtonVariant(variant: ButtonVariant | undefined) {
  switch (variant) {
    case "outlined":
      return "outline";
    case "text":
      return "ghost";
    default:
      return "default";
  }
}

function mapButtonSize(size: ButtonSize | undefined) {
  switch (size) {
    case "small":
      return "sm";
    case "large":
      return "lg";
    default:
      return "default";
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      startIcon,
      sx,
      style,
      fullWidth,
      color,
      component = "button",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      fullWidth && "w-full",
      color === "error" && variant === "contained" && "bg-destructive text-destructive-foreground",
      color === "error" && variant === "outlined" && "border-destructive/40 text-destructive",
      className
    );

    if (component === "label") {
      return (
        <label
          className={cn(
            "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
            variant === "contained" && "border-primary bg-primary text-primary-foreground hover:opacity-90",
            variant === "outlined" && "border-input bg-background hover:bg-accent hover:text-accent-foreground",
            (!variant || variant === "text") && "border-transparent hover:bg-accent hover:text-accent-foreground",
            size === "small" && "h-8 px-3 text-xs",
            size === "large" && "h-10 px-6",
            classes
          )}
          style={{ ...sxToStyle(sx), ...style }}
        >
          {startIcon ? <span className="inline-flex items-center">{startIcon}</span> : null}
          {children}
        </label>
      );
    }

    return (
      <ShadcnButton
        ref={ref}
        variant={mapButtonVariant(variant) as React.ComponentProps<typeof ShadcnButton>["variant"]}
        size={mapButtonSize(size) as React.ComponentProps<typeof ShadcnButton>["size"]}
        className={classes}
        style={{ ...sxToStyle(sx), ...style }}
        {...props}
      >
        {startIcon ? <span className="inline-flex items-center">{startIcon}</span> : null}
        {children}
      </ShadcnButton>
    );
  }
);

Button.displayName = "Button";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: "default" | "primary" | "error";
  size?: "small" | "medium" | "large";
  sx?: SxProps;
  component?: "button" | "label";
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      color = "default",
      size = "medium",
      className,
      children,
      sx,
      component = "button",
      ...props
    },
    ref
  ) => {
    if (component === "label") {
      return (
        <label
          className={cn(
            "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            size === "small" && "h-8 w-8",
            size === "large" && "h-10 w-10",
            color === "primary" && "text-primary",
            color === "error" && "text-destructive",
            className
          )}
          style={sxToStyle(sx)}
        >
          {children}
        </label>
      );
    }
    return (
      <ShadcnButton
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn(
          size === "small" && "h-8 w-8",
          size === "large" && "h-10 w-10",
          color === "primary" && "text-primary",
          color === "error" && "text-destructive hover:text-destructive",
          className
        )}
        style={sxToStyle(sx)}
        {...props}
      >
        {children}
      </ShadcnButton>
    );
  }
);

IconButton.displayName = "IconButton";

type TooltipProps = {
  title: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  arrow?: boolean;
  children: React.ReactElement;
};

export function Tooltip({ title, placement = "top", children }: TooltipProps) {
  return (
    <TooltipProvider>
      <RadixTooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={placement}>{title}</TooltipContent>
      </RadixTooltip>
    </TooltipProvider>
  );
}

type LinearProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "determinate" | "indeterminate";
  value?: number;
  sx?: SxProps;
};

export function LinearProgress({
  variant = "indeterminate",
  value = 0,
  sx,
  className,
  style,
  ...props
}: LinearProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    >
      <div
        className={cn(
          "h-full bg-primary transition-all",
          variant === "indeterminate" && "w-1/2 animate-pulse"
        )}
        style={variant === "determinate" ? { width: `${pct}%` } : undefined}
      />
    </div>
  );
}

type StepperContextValue = { activeStep: number };
const StepperContext = React.createContext<StepperContextValue>({ activeStep: 0 });

type StepperProps = React.HTMLAttributes<HTMLOListElement> & {
  activeStep?: number;
  sx?: SxProps;
};

type InternalStepAugment = {
  __compatStepIndex?: number;
};

export function Stepper({ activeStep = 0, sx, className, style, children, ...props }: StepperProps) {
  const mappedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child as React.ReactElement<InternalStepAugment>, {
      __compatStepIndex: index,
    });
  });

  return (
    <StepperContext.Provider value={{ activeStep }}>
      <ol
        className={cn("grid gap-2 md:grid-cols-6", className)}
        style={{ ...sxToStyle(sx), ...style }}
        {...props}
      >
        {mappedChildren}
      </ol>
    </StepperContext.Provider>
  );
}

type StepProps = React.HTMLAttributes<HTMLLIElement> &
  InternalStepAugment & {
    children?: React.ReactNode;
  };

export function Step({ className, children, ...props }: StepProps) {
  const { __compatStepIndex, ...rest } = props;
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<InternalStepAugment>, {
        __compatStepIndex,
      })
    : children;

  return (
    <li className={cn("min-w-0", className)} {...rest}>
      {child}
    </li>
  );
}

type StepLabelProps = React.HTMLAttributes<HTMLDivElement> & InternalStepAugment;

export function StepLabel({ className, children, __compatStepIndex = 0, ...props }: StepLabelProps) {
  const { activeStep } = React.useContext(StepperContext);
  const isActive = __compatStepIndex === activeStep;
  const isDone = __compatStepIndex < activeStep;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-2 py-2 text-sm",
        isActive && "border-primary bg-primary/5 text-primary",
        isDone && "border-emerald-300 bg-emerald-50 text-emerald-700",
        !isActive && !isDone && "border-border text-muted-foreground",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
          isActive && "border-primary bg-primary text-primary-foreground",
          isDone && "border-emerald-600 bg-emerald-600 text-white"
        )}
      >
        {__compatStepIndex + 1}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
}

type TabsProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value: number;
  onChange?: (event: React.SyntheticEvent, newValue: number) => void;
};

type TabProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  label?: React.ReactNode;
  __compatTabIndex?: number;
  __compatSelected?: boolean;
  __compatOnSelect?: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void;
};

export function Tabs({ value, onChange, className, children, ...props }: TabsProps) {
  const mappedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child as React.ReactElement<TabProps>, {
      __compatTabIndex: index,
      __compatSelected: value === index,
      __compatOnSelect: (event, tabIndex) => onChange?.(event, tabIndex),
    });
  });

  return (
    <div className={cn("flex flex-wrap gap-2", className)} {...props}>
      {mappedChildren}
    </div>
  );
}

export function Tab({
  icon,
  iconPosition = "start",
  label,
  className,
  __compatTabIndex = 0,
  __compatSelected = false,
  __compatOnSelect,
  ...props
}: TabProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
        __compatSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={(event) => {
        props.onClick?.(event);
        __compatOnSelect?.(event, __compatTabIndex);
      }}
      {...props}
    >
      {iconPosition === "start" && icon ? <span className="inline-flex">{icon}</span> : null}
      <span>{label}</span>
      {iconPosition === "end" && icon ? <span className="inline-flex">{icon}</span> : null}
    </button>
  );
}

type ListProps = React.HTMLAttributes<HTMLDivElement>;
export function List({ className, ...props }: ListProps) {
  return <div className={cn("rounded-md border", className)} {...props} />;
}

type ListItemProps = React.HTMLAttributes<HTMLDivElement> & { divider?: boolean };
export function ListItem({ divider, className, ...props }: ListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-3",
        divider && "border-b last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

type ListItemTextProps = {
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
};
export function ListItemText({ primary, secondary }: ListItemTextProps) {
  return (
    <div className="min-w-0 flex-1">
      {primary ? <div className="truncate text-sm font-medium">{primary}</div> : null}
      {secondary ? <div className="truncate text-xs text-muted-foreground">{secondary}</div> : null}
    </div>
  );
}

export function ListItemSecondaryAction(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shrink-0", props.className)} {...props} />;
}

type DividerProps = React.HTMLAttributes<HTMLDivElement> & {
  sx?: SxProps;
};

export function Divider({ className, style, sx, ...props }: DividerProps) {
  return (
    <div
      className={cn("h-px w-full bg-border", className)}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    />
  );
}

type PaperProps = React.HTMLAttributes<HTMLDivElement> & {
  elevation?: number;
  sx?: SxProps;
};

export function Paper({ elevation = 1, sx, className, style, ...props }: PaperProps) {
  return (
    <div
      className={cn("rounded-xl border bg-card text-card-foreground", className)}
      style={{
        boxShadow:
          elevation > 0 ? "0 2px 8px rgba(0,0,0,0.06)" : undefined,
        ...sxToStyle(sx),
        ...style,
      }}
      {...props}
    />
  );
}

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  sx?: SxProps;
};

export function Card({ sx, className, style, ...props }: CardProps) {
  return (
    <ShadcnCard
      className={className}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    />
  );
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  sx?: SxProps;
};

export function CardContent({ sx, className, style, ...props }: CardContentProps) {
  return (
    <ShadcnCardContent
      className={className}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    />
  );
}

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  severity?: "error" | "warning" | "success" | "info";
  sx?: SxProps;
  icon?: React.ReactNode;
};

export function Alert({
  severity = "info",
  sx,
  icon,
  className,
  style,
  children,
  ...props
}: AlertProps) {
  const severityClasses: Record<string, string> = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };
  return (
    <div
      role="alert"
      className={cn("rounded-md border px-3 py-2 text-sm", severityClasses[severity], className)}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    >
      <div className="flex items-start gap-2">
        {icon ? <span className="mt-0.5 inline-flex shrink-0">{icon}</span> : null}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export type ChipProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  size?: "small" | "medium";
  sx?: SxProps;
  icon?: React.ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
  variant?: "filled" | "outlined";
};

export function Chip({
  label,
  size = "medium",
  sx,
  icon,
  color = "default",
  variant = "filled",
  className,
  style,
  ...props
}: ChipProps) {
  const colorClasses: Record<NonNullable<ChipProps["color"]>, string> = {
    default: variant === "outlined" ? "border-border bg-transparent text-foreground" : "bg-secondary text-secondary-foreground",
    primary: variant === "outlined" ? "border-primary/40 text-primary bg-transparent" : "bg-primary text-primary-foreground",
    secondary: variant === "outlined" ? "border-secondary/40 text-secondary-foreground bg-transparent" : "bg-secondary text-secondary-foreground",
    success: variant === "outlined" ? "border-emerald-400/60 text-emerald-700 bg-transparent" : "bg-emerald-600 text-white",
    warning: variant === "outlined" ? "border-amber-400/60 text-amber-700 bg-transparent" : "bg-amber-600 text-white",
    error: variant === "outlined" ? "border-red-400/60 text-red-700 bg-transparent" : "bg-red-600 text-white",
    info: variant === "outlined" ? "border-blue-400/60 text-blue-700 bg-transparent" : "bg-blue-600 text-white",
  };
  return (
    <ShadcnBadge
      className={cn(
        "inline-flex items-center gap-1.5",
        size === "small" && "px-2 py-0 text-[11px]",
        colorClasses[color],
        className
      )}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    >
      {icon ? <span className="inline-flex items-center">{icon}</span> : null}
      {label}
    </ShadcnBadge>
  );
}

type CircularProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export function CircularProgress({ size = 24, className, style, ...props }: CircularProgressProps) {
  return (
    <div
      className={cn("animate-spin rounded-full border-2 border-muted border-t-primary", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  );
}

type SwitchProps = {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  name?: string;
  color?: "primary";
  disabled?: boolean;
};

export function Switch({ checked = false, onChange, name, disabled }: SwitchProps) {
  return (
    <ShadcnSwitch
      checked={checked}
      disabled={disabled}
      onCheckedChange={(next) => {
        const synthetic = {
          target: { name, checked: !!next },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange?.(synthetic, !!next);
      }}
    />
  );
}

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> & {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  sx?: SxProps;
};

export function Checkbox({ checked = false, onChange, sx, className, style, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange?.(event, event.target.checked)}
      className={cn("h-4 w-4 rounded border-input accent-[var(--color-primary)]", className)}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    />
  );
}

export function FormGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", props.className)} {...props} />;
}

type FormControlLabelProps = {
  control: React.ReactNode;
  label: React.ReactNode;
  sx?: SxProps;
  className?: string;
};

export function FormControlLabel({ control, label, sx, className }: FormControlLabelProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 text-sm", className)} style={sxToStyle(sx)}>
      {control}
      <span className="w-full">{label}</span>
    </label>
  );
}

type InputLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function InputLabel({ className, ...props }: InputLabelProps) {
  return <label className={cn("mb-1 block text-sm font-medium", className)} {...props} />;
}

type MenuItemProps = React.OptionHTMLAttributes<HTMLOptionElement>;

export function MenuItem(props: MenuItemProps) {
  return <option {...props} />;
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: React.ReactNode;
  size?: "small" | "medium";
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, size, style, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm",
        size === "small" ? "h-8" : "h-9",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

type FormHelperTextProps = React.HTMLAttributes<HTMLParagraphElement> & {
  error?: boolean;
  sx?: SxProps;
};

export function FormHelperText({ error, sx, className, style, ...props }: FormHelperTextProps) {
  return (
    <p
      className={cn("mt-1 text-xs", error ? "text-destructive" : "text-muted-foreground", className)}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    />
  );
}

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  sx?: SxProps;
};

export function Avatar({ src, alt, sx, className, style, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-muted text-foreground",
        className
      )}
      style={{ width: 40, height: 40, ...sxToStyle(sx), ...style }}
      {...props}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : children}
    </div>
  );
}

type TableSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  sx?: SxProps;
};

export function ListSection({ sx, className, style, ...props }: TableSectionProps) {
  return <div className={className} style={{ ...sxToStyle(sx), ...style }} {...props} />;
}

type DialogProps = {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, children }: DialogProps) {
  return <ShadcnDialog open={open} onOpenChange={(next) => !next && onClose?.()}>{children}</ShadcnDialog>;
}

export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <ShadcnDialogTitle {...props} />;
}

type DialogContentProps = React.HTMLAttributes<HTMLDivElement>;
export function DialogContent({ className, ...props }: DialogContentProps) {
  return (
    <ShadcnDialogContent className={cn("gap-3", className)}>
      <ShadcnDialogHeader className="space-y-2">{props.children}</ShadcnDialogHeader>
    </ShadcnDialogContent>
  );
}

export function DialogActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <ShadcnDialogFooter className={className} {...props} />;
}

type DialogTitleContainerProps = React.HTMLAttributes<HTMLDivElement>;
export function DialogContentText({ className, ...props }: DialogTitleContainerProps) {
  return <div className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

type TableContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  component?: React.ElementType;
};

export function TableContainer({ component: _component, className, ...props }: TableContainerProps) {
  return <div className={cn("overflow-auto rounded-md border", className)} {...props} />;
}

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;
export function Table(props: TableProps) {
  return <ShadcnTable {...props} />;
}
export function TableHead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <ShadcnTableHeader {...props} />;
}
export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <ShadcnTableBody {...props} />;
}

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  hover?: boolean;
  sx?: SxProps;
};
export function TableRow({ hover, sx, className, style, ...props }: TableRowProps) {
  return (
    <ShadcnTableRow
      className={cn(hover && "hover:bg-muted/50", className)}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    />
  );
}

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right" | "center";
  sx?: SxProps;
};
export function TableCell({ align, sx, className, style, ...props }: TableCellProps) {
  return (
    <ShadcnTableCell
      className={cn(
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    />
  );
}

type FabProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "circular" | "extended";
  color?: "primary" | "secondary";
  sx?: SxProps;
};
export function Fab({
  variant = "circular",
  color = "primary",
  sx,
  className,
  style,
  children,
  ...props
}: FabProps) {
  return (
    <ShadcnButton
      className={cn(
        variant === "extended" ? "h-10 rounded-full px-4" : "h-12 w-12 rounded-full",
        color === "primary" && "bg-primary text-primary-foreground",
        className
      )}
      style={{ ...sxToStyle(sx), ...style }}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
}
