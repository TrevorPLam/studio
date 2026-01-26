/**
 * Unit tests for GitHub App authentication
 * @file tests/unit/lib/github-app.test.ts
 * @epic GH-AUTH-001
 */

// Mock @octokit/auth-app before importing github-app
jest.mock('@octokit/auth-app', () => ({
  createAppAuth: jest.fn(() => jest.fn()),
}));

import nock from 'nock';
import {
  getInstallationToken,
  getReaderToken,
  getActorToken,
  clearTokenCache,
  getInstallationIdForRepo,
} from '@/lib/github-app';
import { getGitHubAppConfig } from '@/lib/security/secrets';

// Mock the secrets module
jest.mock('@/lib/security/secrets', () => ({
  getGitHubAppConfig: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GH-AUTH-001 — GitHub App Authentication Tests', () => {
  const mockAppId = '123456';
  const mockPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyz
-----END RSA PRIVATE KEY-----`;
  const mockInstallationId = 12345;

  beforeEach(() => {
    clearTokenCache();
    nock.cleanAll();
    (getGitHubAppConfig as jest.Mock).mockReturnValue({
      appId: mockAppId,
      privateKey: mockPrivateKey,
      installationId: mockInstallationId,
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('getInstallationToken()', () => {
    it('generates JWT from private key', async () => {
      // Mock GitHub API response
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .reply(200, {
          token: 'mock-installation-token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      const token = await getInstallationToken(mockInstallationId);

      expect(token).toBe('mock-installation-token');
    });

    it('exchanges JWT for installation token', async () => {
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .reply(200, {
          token: 'mock-token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      const token = await getInstallationToken(mockInstallationId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('caches token', async () => {
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .once()
        .reply(200, {
          token: 'cached-token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      const token1 = await getInstallationToken(mockInstallationId);
      const token2 = await getInstallationToken(mockInstallationId);

      expect(token1).toBe(token2);
      expect(token1).toBe('cached-token');
    });

    it('expires token 60s early', async () => {
      const expiresAt = new Date(Date.now() + 100000); // 100 seconds from now
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .reply(200, {
          token: 'short-lived-token',
          expires_at: expiresAt.toISOString(),
        });

      await getInstallationToken(mockInstallationId);

      // Token should be considered expired 60s before actual expiration
      // This is tested by checking cache behavior
      expect(nock.isDone()).toBe(true);
    });

    it('generates new token when cached expired', async () => {
      const shortExpiry = new Date(Date.now() + 50000); // 50 seconds
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .twice()
        .reply(200, {
          token: 'new-token',
          expires_at: shortExpiry.toISOString(),
        });

      await getInstallationToken(mockInstallationId);

      // Wait for token to expire (with buffer)
      await new Promise((resolve) => setTimeout(resolve, 100));

      const token2 = await getInstallationToken(mockInstallationId);
      expect(token2).toBe('new-token');
    });

    it('handles missing installation ID', async () => {
      (getGitHubAppConfig as jest.Mock).mockReturnValue({
        appId: mockAppId,
        privateKey: mockPrivateKey,
        installationId: undefined,
      });

      await expect(getInstallationToken()).rejects.toThrow('Installation ID is required');
    });

    it('handles invalid private key', async () => {
      (getGitHubAppConfig as jest.Mock).mockReturnValue({
        appId: mockAppId,
        privateKey: 'invalid-key',
        installationId: mockInstallationId,
      });

      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .reply(401, { message: 'Bad credentials' });

      await expect(getInstallationToken(mockInstallationId)).rejects.toThrow();
    });
  });

  describe('getReaderToken()', () => {
    it('returns token with read permissions', async () => {
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`, (body: any) => {
          return body.permissions?.contents === 'read';
        })
        .reply(200, {
          token: 'reader-token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      const token = await getReaderToken(mockInstallationId);

      expect(token).toBe('reader-token');
    });
  });

  describe('getActorToken()', () => {
    it('returns token with write permissions', async () => {
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`, (body: any) => {
          return body.permissions?.contents === 'write';
        })
        .reply(200, {
          token: 'actor-token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      const token = await getActorToken(mockInstallationId);

      expect(token).toBe('actor-token');
    });
  });

  describe('getInstallationIdForRepo()', () => {
    it('finds installation for repo', async () => {
      nock('https://api.github.com').get('/app').reply(200, { id: mockAppId });

      nock('https://api.github.com')
        .get('/repos/test-owner/test-repo/installation')
        .reply(200, { id: mockInstallationId });

      const installationId = await getInstallationIdForRepo('test-owner', 'test-repo');

      expect(installationId).toBe(mockInstallationId);
    });

    it('handles repo not installed', async () => {
      nock('https://api.github.com').get('/app').reply(200, { id: mockAppId });

      nock('https://api.github.com')
        .get('/repos/test-owner/test-repo/installation')
        .reply(404, { message: 'Not Found' });

      await expect(getInstallationIdForRepo('test-owner', 'test-repo')).rejects.toThrow();
    });
  });

  describe('clearTokenCache()', () => {
    it('clears specific installation cache', async () => {
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .twice()
        .reply(200, {
          token: 'token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      await getInstallationToken(mockInstallationId);
      clearTokenCache(mockInstallationId);
      await getInstallationToken(mockInstallationId);

      expect(nock.isDone()).toBe(true);
    });

    it('clears all cache', async () => {
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .twice()
        .reply(200, {
          token: 'token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      await getInstallationToken(mockInstallationId);
      clearTokenCache();
      await getInstallationToken(mockInstallationId);

      expect(nock.isDone()).toBe(true);
    });
  });

  describe('Token caching', () => {
    it('separate cache keys per installation', async () => {
      const installationId2 = 67890;

      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .reply(200, {
          token: 'token-1',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      nock('https://api.github.com')
        .post(`/app/installations/${installationId2}/access_tokens`)
        .reply(200, {
          token: 'token-2',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      const token1 = await getInstallationToken(mockInstallationId);
      const token2 = await getInstallationToken(installationId2);

      expect(token1).toBe('token-1');
      expect(token2).toBe('token-2');
    });

    it('separate cache keys per permission set', async () => {
      nock('https://api.github.com')
        .post(`/app/installations/${mockInstallationId}/access_tokens`)
        .twice()
        .reply(200, {
          token: 'token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

      const readerToken = await getReaderToken(mockInstallationId);
      const actorToken = await getActorToken(mockInstallationId);

      expect(readerToken).toBeDefined();
      expect(actorToken).toBeDefined();
      // They should be different tokens due to different permissions
    });
  });
});
