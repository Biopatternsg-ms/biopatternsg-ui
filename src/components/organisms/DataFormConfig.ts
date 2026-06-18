import type { ZodType } from "zod";
import type { FieldValues } from "react-hook-form";

export interface FieldDescriptor {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea";
  placeholder: string;
  autoComplete?: string;
  helperText?: string;
  labelRight?: React.ReactNode;
  colSpan?: "full" | "half";
  rows?: number;
}

export interface DataFormConfig<T extends FieldValues> {
  schema: ZodType<any, any, any>;
  fields: FieldDescriptor[];
  title: string;
  subtitle?: string;
  submitLabel: string;
  submittingLabel: string;
  
  onSubmit: (values: T) => Promise<Response>;
  
  successStatus: number | "ok";
  successModal: {
    title: string;
    message: string;
  };
  
  errorModal: {
    title?: string;
    defaultMessage: string;
    parseResponseMessage?: boolean;
  };
  
  onSuccessClose?: () => void;
  onSuccessResponse?: (response: Response) => Promise<void>;
  onErrorClose?: () => void;
  
  footerLink?: {
    text: string;
    label: string;
    to: string;
  };
}
