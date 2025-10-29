/** @type {import('jest').Config} */
// import '@testing-library/jest-dom/extend-expect';

const config = {
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  testMatch: ['**/*.test.ts'],
};

export default config;
