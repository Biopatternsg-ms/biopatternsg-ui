/*
 * Copyright © 2026 biopatternsg (biopatternsg@gmail.com)
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from "react";
import { CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SuccessModalProps {
  /** Controls visibility of the modal */
  open: boolean;
  /** Main message shown in the body of the modal */
  message: string;
  /** Callback fired when the modal is closed (via backdrop, X or the confirmation button) */
  onClose: () => void;
  /** Optional title. Defaults to "¡Registro exitoso!" */
  title?: string;
}

/**
 * Molecule: SuccessModal
 * A highly polished, custom animated Success Modal styled to fit the clinical platform aesthetic.
 * 
 * Rules Adhered:
 *   - "Glass & Gradient" Rule: uses .glass-panel backdrop filter blur.
 *   - "No-Line" Rule: separation achieved via sutil ghost borders (outline-variant/15) and tinted shadow-ambient.
 *   - Accessibility: role="dialog", aria-modal="true", traps focus, and listens to the Escape key.
 */
const SuccessModal = React.forwardRef<HTMLDivElement, SuccessModalProps>(
  ({ open, message, onClose, title = "Registration Successful!" }, ref) => {
    // Prevent background scrolling when open
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    // Close on Escape keypress
    React.useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    // Auto-close after 1.5 seconds
    React.useEffect(() => {
      if (!open) return;
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
        onClick={onClose}
      >
        {/* Semi-transparent backdrop with blur */}
        <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity duration-300" />

        {/* Modal card content */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-heading"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative z-10 w-full max-w-md",
            "glass-panel rounded-2xl p-8",
            "border border-outline-variant/15",
            "shadow-xl",
            "transition-all duration-300 transform scale-100",
            "animate-in fade-in zoom-in-95 duration-200"
          )}
        >
          {/* Close button X */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg p-1 hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Sutil decorative blur background orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          {/* Core Content */}
          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            {/* Success icon container */}
            <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-ambient">
              <CheckCircle className="w-8 h-8 text-tertiary" strokeWidth={2} />
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <h2
                id="success-modal-heading"
                className="text-xl font-black font-headline tracking-tight text-on-surface"
              >
                {title}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SuccessModal.displayName = "SuccessModal";

export { SuccessModal };
