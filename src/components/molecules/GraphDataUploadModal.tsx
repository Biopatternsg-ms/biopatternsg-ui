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

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import type {
  GraphNodeInput,
  GraphLinkInput,
} from "@/components/organisms/forceGraph/forceGraphTypes";
import { parseAndValidateGraphFiles } from "@/utils/graphDataParser";

export interface GraphDataUploadModalProps {
  open: boolean;
  onLoaded: (data: { nodes: GraphNodeInput[]; links: GraphLinkInput[] }) => void;
  onCancel: () => void;
}

export const GraphDataUploadModal: React.FC<GraphDataUploadModalProps> = ({
  open,
  onLoaded,
  onCancel,
}) => {
  const [nodesFile, setNodesFile] = useState<File | null>(null);
  const [linksFile, setLinksFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  const downloadTemplate = (href: string, filename: string) => {
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isTxtFile = (file: File): boolean => {
    return file.name.toLowerCase().endsWith(".txt") || file.type === "text/plain";
  };

  const handleNodesChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    setNodesFile(file);
    setErrorMessage(null);
  };

  const handleLinksChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    setLinksFile(file);
    setErrorMessage(null);
  };

  const handleLoad = async () => {
    if (!nodesFile || !linksFile) {
      return;
    }

    if (!isTxtFile(nodesFile) || !isTxtFile(linksFile)) {
      setErrorMessage(
        "There is a problem with the format of the data entered in the TXT files. Please check the example files and try again."
      );
      return;
    }

    setIsLoading(true);
    try {
      const nodesText = await nodesFile.text();
      const linksText = await linksFile.text();
      const { nodes, links } = parseAndValidateGraphFiles(nodesText, linksText);
      setErrorMessage(null);
      onLoaded({ nodes, links });
    } catch {
      setErrorMessage(
        "There is a problem with the format of the data entered in the TXT files. Please check the example files and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm animate-in fade-in duration-200"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-graph-modal-heading"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg bg-surface-card rounded-2xl p-6 sm:p-8 border border-outline-variant/20 shadow-xl animate-in zoom-in-95 duration-200 space-y-6"
      >
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
          <div>
            <h2
              id="upload-graph-modal-heading"
              className="text-xl font-headline font-bold text-on-surface"
            >
              Upload Graph Data
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Select the nodes and links TXT files to render the graph.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close modal"
            className="text-on-surface-variant hover:text-on-surface transition-colors rounded-lg p-1.5 hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <FormField
            label="Nodes file (.txt)"
            type="file"
            accept=".txt,text/plain"
            labelRight={
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() =>
                  downloadTemplate(
                    "/templates/graph-nodes-example.txt",
                    "graph-nodes-example.txt"
                  )
                }
              >
                Download example TXT
              </Button>
            }
            onChange={handleNodesChange}
          />

          <FormField
            label="Links file (.txt)"
            type="file"
            accept=".txt,text/plain"
            labelRight={
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() =>
                  downloadTemplate(
                    "/templates/graph-links-example.txt",
                    "graph-links-example.txt"
                  )
                }
              >
                Download example TXT
              </Button>
            }
            onChange={handleLinksChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleLoad}
            disabled={!nodesFile || !linksFile || isLoading}
          >
            {isLoading ? "Loading..." : "Load"}
          </Button>
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-error font-medium text-center mt-2">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default GraphDataUploadModal;
