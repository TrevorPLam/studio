/**
 * Unit tests for secrets management
 * @file tests/unit/lib/security/secrets.test.ts
 */

import { getGitHubAppConfig, isGitHubAppConfigured } from '@/lib/security/secrets';

describe('Secrets Management Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getGitHubAppConfig()', () => {
    it('reads from environment variables', () => {
      process.env.GITHUB_APP_ID = '123456';
      process.env.GITHUB_APP_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMOCK_KEY\n-----END RSA PRIVATE KEY-----';

      const config = getGitHubAppConfig();

      expect(config.appId).toBe('123456');
      expect(config.privateKey).toContain('MOCK_KEY');
    });

    it('handles newlines in private key', () => {
      process.env.GITHUB_APP_ID = '123456';
      process.env.GITHUB_APP_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\\nMOCK_KEY\\n-----END RSA PRIVATE KEY-----';

      const config = getGitHubAppConfig();

      expect(config.privateKey).toContain('\n');
      expect(config.privateKey).not.toContain('\\n');
    });

    it('throws error if appId missing', () => {
      delete process.env.GITHUB_APP_ID;
      process.env.GITHUB_APP_PRIVATE_KEY = 'mock-key';

      expect(() => getGitHubAppConfig()).toThrow('GITHUB_APP_ID environment variable is required');
    });

    it('throws error if privateKey missing', () => {
      process.env.GITHUB_APP_ID = '123456';
      delete process.env.GITHUB_APP_PRIVATE_KEY;

      expect(() => getGitHubAppConfig()).toThrow('GITHUB_APP_PRIVATE_KEY environment variable is required');
    });

    it('handles optional installationId', () => {
      process.env.GITHUB_APP_ID = '123456';
      process.env.GITHUB_APP_PRIVATE_KEY = 'mock-key';
      delete process.env.GITHUB_APP_INSTALLATION_ID;

      const config = getGitHubAppConfig();

      expect(config.installationId).toBeUndefined();
    });

    it('parses installationId when provided', () => {
      process.env.GITHUB_APP_ID = '123456';
      process.env.GITHUB_APP_PRIVATE_KEY = 'mock-key';
      process.env.GITHUB_APP_INSTALLATION_ID = '12345';

      const config = getGitHubAppConfig();

      expect(config.installationId).toBe(12345);
    });
  });

  describe('isGitHubAppConfigured()', () => {
    it('returns true when configured', () => {
      process.env.GITHUB_APP_ID = '123456';
      process.env.GITHUB_APP_PRIVATE_KEY = 'mock-key';

      expect(isGitHubAppConfigured()).toBe(true);
    });

    it('returns false when missing config', () => {
      delete process.env.GITHUB_APP_ID;
      delete process.env.GITHUB_APP_PRIVATE_KEY;

      expect(isGitHubAppConfigured()).toBe(false);
    });
  });
});
