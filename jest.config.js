module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/__tests__/**',
        '!src/server.ts',
        '!src/config/data-source.ts',
    ],
    coverageThreshold: {
        global: {
            functions: 0,
            lines: 80,
            statements: 0,
        },
    },
    coverageReporters: ['text', 'lcov', 'html'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: 'tsconfig.test.json'
        }],
    },
    // Ignore node_modules except those that need transformation
    transformIgnorePatterns: [
        'node_modules/(?!(uuid|@nestjs|typeorm)/)' // Add packages that use ESM
    ],
    // Mock problematic modules
    moduleNameMapper: {
        '^uuid$': '<rootDir>/node_modules/uuid/dist/index.js',
        // If you have other ESM issues, add them here
    },
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
    // Clear mocks between tests
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    passWithNoTests: false,
};