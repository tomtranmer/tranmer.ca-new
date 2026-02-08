import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      // Allow unescaped apostrophes in JSX text content
      // They display correctly and don't need HTML entity escaping
      'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    },
  },
])

export default eslintConfig
