import React from "react";
import { FlaskConical } from "lucide-react";
import { Button } from "components/ui/button";
import { isDev } from "../lib/env";

interface DevFillButtonProps {
  /** Called when the button is clicked. Typically populates the surrounding form. */
  onFill: () => void;
  /** Optional label override. Defaults to "Preencher exemplo". */
  label?: string;
  /** Optional className to adjust spacing in the host layout. */
  className?: string;
}

/**
 * Small outlined button that populates the surrounding form with sample data.
 * Renders nothing in production builds.
 */
export const DevFillButton: React.FC<DevFillButtonProps> = ({
  onFill,
  label = "Preencher exemplo",
  className,
}) => {
  if (!isDev) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onFill}
      className={className}
    >
      <FlaskConical className="h-4 w-4" />
      {label}
    </Button>
  );
};
