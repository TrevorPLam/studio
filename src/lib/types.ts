// GitHub API Types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  owner: {
    login: string;
    avatar_url: string;
    id: number;
  };
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
    id: number;
  } | null;
  committer: {
    login: string;
    avatar_url: string;
    id: number;
  } | null;
  html_url: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

// Agent Types
export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AgentSession {
  id: string;
  name: string;
  model: string;
  createdAt: string;
  messages?: AgentMessage[];
  repository?: string;
  lastMessage?: string;
}

// API Error Types
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public rateLimitRemaining?: number,
    public rateLimitReset?: number
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export class AIAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public model?: string
  ) {
    super(message);
    this.name = 'AIAPIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// NextAuth Types
export interface ExtendedSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}
