/** @type {import('jest').Config} */
const config = {
  verbose: true,
  transformIgnorePatterns: ['node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)'],
  testPathIgnorePatterns: ['/node_modules/', '__mocks__'],
};

export default config;
