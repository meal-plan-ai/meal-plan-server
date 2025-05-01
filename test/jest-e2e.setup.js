// Set environment variables for tests
process.env.NODE_ENV = 'test';

// Add JWT secret for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret';
process.env.JWT_EXPIRES_IN = '1d';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';

// Testing timeouts
jest.setTimeout(30000); // 30 seconds timeout