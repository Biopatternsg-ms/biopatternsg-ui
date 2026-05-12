import * as React from "react";
import { Label } from "@/components/atoms/Label";
import { Input, type InputProps } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends InputProps {
  label: string;
  labelRight?: React.ReactNode;
  containerClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, labelRight, containerClassName, className, ...inputProps }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex justify-between items-center">
          <Label>{label}</Label>
          {labelRight && <div>{labelRight}</div>}
        </div>
        <Input ref={ref} className={className} {...inputProps} />
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
