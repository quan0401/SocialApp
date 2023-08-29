import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  // so it should be inside test
  testMatch: ['<rootDir>/src/**/test/*.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/test/*.ts?(x)', '!**/node_modules/**'],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1
    }
  },
  coverageReporters: ['text-summary', 'lcov'],
  moduleNameMapper: {
    '~auth/(.*)': ['<rootDir>/src/features/auth/$1'],
    '~reaction/(.*)': ['<rootDir>/src/features/reaction/$1'],
    '~nofitication/(.*)': ['<rootDir>/src/features/nofitication/$1'],
    '~follower/(.*)': ['<rootDir>/src/features/follower/$1'],
    '~image/(.*)': ['<rootDir>/src/features/image/$1'],
    '~comment/(.*)': ['<rootDir>/src/features/comment/$1'],
    '~post/(.*)': ['<rootDir>/src/features/post/$1'],
    '~user/(.*)': ['<rootDir>/src/features/user/$1'],
    '~global/(.*)': ['<rootDir>/src/shared/globals/$1'],
    '~services/(.*)': ['<rootDir>/src/shared/services/$1'],
    '~sockets/(.*)': ['<rootDir>/src/shared/sockets/$1'],
    '~workers/(.*)': ['<rootDir>/src/shared/workers/$1'],
    '~mocks/(.*)': ['<rootDir>/src/mocks/$1'],
    '~/(.*)': ['<rootDir>/src/$1']
  }
};

export default config;
