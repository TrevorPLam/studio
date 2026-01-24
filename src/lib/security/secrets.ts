/**
 * Secrets Management Module
 *
 * Centralized secure handling of sensitive configuration values.
 * Per GH-AUTH-001: GitHub App private key management.
 */

/**
 * Get GitHub App configuration from environment variables.
 *
 * @returns GitHub App configuration
 * @throws Error if required values are missing
 */
export function getGitHubAppConfig() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  if (!appId) {
    throw new Error('GITHUB_APP_ID environment variable is required');
  }

  if (!privateKey) {
    throw new Error('GITHUB_APP_PRIVATE_KEY environment variable is required');
  }

  // Installation ID is optional - can be provided per-request
  return {
    appId,
    privateKey: privateKey.replace(/\\n/g, '\n'), // Handle newlines in env vars
    installationId: installationId ? parseInt(installationId, 10) : undefined,
  };
}

/**
 * Check if GitHub App authentication is configured.
 *
 * @returns true if all required config is present
 */
export function isGitHubAppConfigured(): boolean {
  try {
    getGitHubAppConfig();
    return true;
  } catch {
    return false;
  }
}
