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
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['src/components/atoms/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/components/atoms/*', '@/components/atoms'], message: 'Atoms must not import other atoms.' },
            { group: ['@/components/molecules/*', '@/components/molecules'], message: 'Atoms must not import molecules.' },
            { group: ['@/components/organisms/*', '@/components/organisms'], message: 'Atoms must not import organisms.' },
            { group: ['@/services/*', '@/services'], message: 'Atoms must not import services.' },
            { group: ['@/adapters/*', '@/adapters'], message: 'Atoms must not import adapters.' },
            { group: ['@/context/*', '@/context'], message: 'Atoms must not import React context.' },
            { group: ['react-router-dom'], message: 'Atoms must not import router hooks.' },
            { group: ['@/modules/*', '@/modules'], message: 'Atoms must not import feature modules.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/molecules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/components/organisms/*', '@/components/organisms'], message: 'Molecules must not import organisms.' },
            { group: ['@/services/*', '@/services'], message: 'Molecules must not import services.' },
            { group: ['@/adapters/*', '@/adapters'], message: 'Molecules must not import adapters.' },
            { group: ['@/context/*', '@/context'], message: 'Molecules must not import React context.' },
            { group: ['react-router-dom'], message: 'Molecules must not import router hooks.' },
            { group: ['@/modules/*', '@/modules'], message: 'Molecules must not import feature modules.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/organisms/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/services/*', '@/services'], message: 'Organisms must not import concrete services.' },
            { group: ['@/adapters/*', '@/adapters'], message: 'Organisms must not import adapters directly.' },
            { group: ['@/modules/*', '@/modules'], message: 'Organisms must not import feature modules.' },
          ],
        },
      ],
    },
  },
  {
    files: ['src/domain/models/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/components/*', '@/components'], message: 'Domain models must not import UI components.' },
            { group: ['@/modules/*', '@/modules'], message: 'Domain models must not import feature modules.' },
            { group: ['@/services/*', '@/services'], message: 'Domain models must not import service DTOs.' },
            { group: ['@/adapters/*', '@/adapters'], message: 'Domain models must not import adapters.' },
            { group: ['@/context/*', '@/context'], message: 'Domain models must not import context.' },
          ],
        },
      ],
    },
  },
])
