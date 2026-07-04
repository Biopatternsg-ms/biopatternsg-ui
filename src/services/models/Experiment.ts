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

export interface TranscriptionFactorConfig {
  sources: string[];
  genome?: string;
  track?: string;
  identity?: number;
  chromosome?: string;
  strand?: string;
  start?: string;
  end?: string;
  reliability: number;
  promoterRegion: string;
}

export interface ExpertObject {
  symbol: string | null;
  uniprotId: string | null;
  hgncId: string | null;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  networkId: string;
  levels?: number;
  retMax?: number;
  step?: string;
  transcriptionFactorConfig?: TranscriptionFactorConfig;
  expertObjects?: ExpertObject[];
  createdAt?: number;
}
