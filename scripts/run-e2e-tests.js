#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const process = require('process');

// Set test environment
process.env.NODE_ENV = 'test';

// Set required environment variables for tests
if (!process.env.NEXT_PUBLIC_STRIPE_SK_TEST) {
  process.env.NEXT_PUBLIC_STRIPE_SK_TEST = 'sk_test_mock_key_for_testing';
}
if (!process.env.STRIPE_SECRET_KEY) {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing';
}
if (!process.env.STRIPE_PUBLISHABLE_KEY) {
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key_for_testing';
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_webhook_secret';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_key_for_development_only';
}
if (!process.env.JWT_EXPIRATION) {
  process.env.JWT_EXPIRATION = '86400'; // 24 hours in seconds
}
if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'sk-test-mock-openai-key-for-testing';
}
if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = 'http://localhost:3000';
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/meal_plan_test';
}

console.log(`📊 Using test environment (NODE_ENV=${process.env.NODE_ENV})`);

// Helper function to run npm commands
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'npm.cmd' : 'npm';
    
    const child = spawn(cmd, ['run', command, ...args], {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to check Docker container health
function checkDatabaseHealth() {
  return new Promise((resolve) => {
    exec('docker inspect --format="{{.State.Health.Status}}" meal-plan-test-db', (error, stdout) => {
      if (error) {
        resolve(false);
      } else {
        resolve(stdout.trim().includes('healthy'));
      }
    });
  });
}

// Helper function to wait with timeout
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2ETests() {
  let testExitCode = 0;

  try {
    console.log('🚀 Starting test database...');
    await runCommand('test:db:up');

    console.log('⏳ Waiting for database to be ready...');
    let isHealthy = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!isHealthy && attempts < maxAttempts) {
      attempts++;
      isHealthy = await checkDatabaseHealth();
      
      if (isHealthy) {
        console.log('✅ Database is ready!');
        break;
      }
      
      if (attempts === maxAttempts) {
        console.log('❌ Database failed to start within timeout.');
        await runCommand('test:db:down');
        process.exit(1);
      }
      
      console.log(`⏳ Still waiting for database... (${attempts}/${maxAttempts})`);
      await sleep(2000);
    }

    console.log('⏳ Giving the database a moment to fully initialize...');
    await sleep(5000);

    console.log('🧪 Running E2E tests...');
    await runCommand('test:e2e:ci', ['--', '--runInBand']);

  } catch (error) {
    console.error('❌ Error during E2E tests:', error.message);
    testExitCode = 1;
  } finally {
    console.log('🧹 Cleaning up - stopping test database...');
    try {
      await runCommand('test:db:down');
    } catch (cleanupError) {
      console.error('⚠️ Error during cleanup:', cleanupError.message);
    }
  }

  process.exit(testExitCode);
}

// Handle process interruption
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal. Cleaning up...');
  try {
    await runCommand('test:db:down');
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error.message);
  }
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received terminate signal. Cleaning up...');
  try {
    await runCommand('test:db:down');
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error.message);
  }
  process.exit(1);
});

// Run the tests
runE2ETests(); 