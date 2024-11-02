// jest.config.cjs

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@everapi/freecurrencyapi-js)/)', // 이 패키지는 변환에서 제외하지 않음
    '<rootDir>/src-capacitor',
    '<rootDir>/node_modules',
  ],
};
