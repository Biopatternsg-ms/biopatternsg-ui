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

import type {
  GraphNodeInput,
  GraphLinkInput,
} from "@/components/organisms/forceGraph/forceGraphTypes";

/**
 * Parses a TXT string containing node definitions separated by semicolons (;).
 * Expected header: `name;type`
 *
 * @throws {Error} If lines < 2, invalid header, or invalid row format.
 */
export function parseGraphNodesTxt(text: string): GraphNodeInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("Invalid nodes file format.");
  }

  const headerCols = lines[0].split(";").map((col) => col.trim().toLowerCase());
  if (
    headerCols.length !== 2 ||
    headerCols[0] !== "name" ||
    headerCols[1] !== "type"
  ) {
    throw new Error("Invalid nodes header.");
  }

  const nodes: GraphNodeInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length !== 2) {
      throw new Error("Invalid node row.");
    }
    const name = parts[0].trim();
    const type = parts[1].trim();
    if (!name || !type) {
      throw new Error("Invalid node row.");
    }
    nodes.push({ name, type });
  }

  return nodes;
}

/**
 * Parses a TXT string containing link definitions separated by semicolons (;).
 * Expected header: `object1;interaction;object2`
 *
 * @throws {Error} If lines < 2, invalid header, or invalid row format.
 */
export function parseGraphLinksTxt(text: string): GraphLinkInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("Invalid links file format.");
  }

  const headerCols = lines[0].split(";").map((col) => col.trim().toLowerCase());
  if (
    headerCols.length !== 3 ||
    headerCols[0] !== "object1" ||
    headerCols[1] !== "interaction" ||
    headerCols[2] !== "object2"
  ) {
    throw new Error("Invalid links header.");
  }

  const links: GraphLinkInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length !== 3) {
      throw new Error("Invalid link row.");
    }
    const object1 = parts[0].trim();
    const interaction = parts[1].trim();
    const object2 = parts[2].trim();
    if (!object1 || !interaction || !object2) {
      throw new Error("Invalid link row.");
    }
    links.push({ object1, interaction, object2 });
  }

  return links;
}

/**
 * Filters out links whose source (`object1`) or target (`object2`) do not exist in the nodes array.
 */
export function filterLinksByValidNodes(
  nodes: ReadonlyArray<GraphNodeInput>,
  links: ReadonlyArray<GraphLinkInput>
): GraphLinkInput[] {
  const nodeNames = new Set(nodes.map((node) => node.name));
  return links.filter(
    (link) => nodeNames.has(link.object1) && nodeNames.has(link.object2)
  );
}

/**
 * Parses both nodes and links text, then filters out links connecting nonexistent nodes.
 */
export function parseAndValidateGraphFiles(
  nodesText: string,
  linksText: string
): { nodes: GraphNodeInput[]; links: GraphLinkInput[] } {
  const nodes = parseGraphNodesTxt(nodesText);
  const rawLinks = parseGraphLinksTxt(linksText);
  const links = filterLinksByValidNodes(nodes, rawLinks);
  return { nodes, links };
}
