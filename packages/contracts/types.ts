/**
 * Shared TypeScript types for Studio API contracts
 */

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Common types
export type SessionId = string;
export type AgentId = string;
export type RepositoryOwner = string;
export type RepositoryName = string;
