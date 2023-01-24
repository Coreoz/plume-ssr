import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const config: Config.InitialOptions = {
  bail: true,
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      'tsconfig': 'tsconfig.json',
      'compiler': 'ttypescript',
    }]
  },
  setupFilesAfterEnv: [
    './src/tests/setupTests.ts'
  ],
  verbose: true,
};
export default config;
