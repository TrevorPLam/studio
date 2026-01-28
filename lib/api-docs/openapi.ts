/**
 * ============================================================================
 * OPENAPI SPECIFICATION GENERATOR
 * ============================================================================
 *
 * @file src/lib/api-docs/openapi.ts
 * @module api-docs
 * @epic BP-DOC-009
 *
 * PURPOSE:
 * Generate OpenAPI 3.0 specification for Firebase Studio API endpoints.
 * Provides interactive API documentation via Swagger UI.
 *
 * RELATED FILES:
 * - src/app/api/docs/route.ts (serves OpenAPI spec and Swagger UI)
 * - All API routes (documented with JSDoc comments)
 *
 * ============================================================================
 */

import swaggerJsdoc from 'swagger-jsdoc';

/**
 * OpenAPI specification definition.
 * This configuration is used by swagger-jsdoc to generate the full spec.
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Firebase Studio API',
      version: '0.1.0',
      description: 'AI-powered agent sessions and GitHub repository management API',
      contact: {
        name: 'Firebase Studio',
        url: 'https://github.com/TrevorPLam/studio',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:9002',
        description: 'Development server',
      },
      {
        url: 'https://api.firebasestudio.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        nextAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'NextAuth session cookie',
        },
      },
      schemas: {
        AgentSession: {
          type: 'object',
          required: ['id', 'userId', 'name', 'model', 'goal', 'state', 'messages', 'createdAt', 'updatedAt'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Session unique identifier',
            },
            userId: {
              type: 'string',
              description: 'User identifier',
            },
            name: {
              type: 'string',
              description: 'Human-readable session name',
            },
            model: {
              type: 'string',
              description: 'AI model identifier',
              example: 'googleai/gemini-2.5-flash',
            },
            goal: {
              type: 'string',
              description: 'Session objective or task',
            },
            repo: {
              type: 'object',
              properties: {
                owner: {
                  type: 'string',
                  description: 'Repository owner',
                },
                name: {
                  type: 'string',
                  description: 'Repository name',
                },
                baseBranch: {
                  type: 'string',
                  description: 'Base branch',
                },
              },
            },
            state: {
              type: 'string',
              enum: ['created', 'planning', 'preview_ready', 'awaiting_approval', 'applying', 'applied', 'failed'],
              description: 'Current session state',
            },
            messages: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AgentMessage',
              },
            },
            lastMessage: {
              type: 'string',
              description: 'Last message preview',
            },
            previewId: {
              type: 'string',
              description: 'Preview identifier',
            },
            pr: {
              type: 'object',
              properties: {
                number: {
                  type: 'number',
                },
                url: {
                  type: 'string',
                },
                head: {
                  type: 'string',
                },
                base: {
                  type: 'string',
                },
              },
            },
            steps: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AgentSessionStep',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        AgentMessage: {
          type: 'object',
          required: ['role', 'content', 'timestamp'],
          properties: {
            role: {
              type: 'string',
              enum: ['user', 'assistant', 'system'],
              description: 'Message role',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Message timestamp',
            },
          },
        },
        AgentSessionStep: {
          type: 'object',
          required: ['type', 'timestamp'],
          properties: {
            type: {
              type: 'string',
              description: 'Step type',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Step timestamp',
            },
            data: {
              type: 'object',
              description: 'Step-specific data',
            },
          },
        },
        CreateAgentSession: {
          type: 'object',
          required: ['name', 'goal'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Optional session ID',
            },
            name: {
              type: 'string',
              description: 'Session name',
            },
            goal: {
              type: 'string',
              description: 'Session goal or objective',
            },
            model: {
              type: 'string',
              description: 'AI model identifier',
              default: 'googleai/gemini-2.5-flash',
            },
            repo: {
              type: 'object',
              properties: {
                owner: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                },
                baseBranch: {
                  type: 'string',
                },
              },
            },
            initialPrompt: {
              type: 'string',
              description: 'Optional initial prompt',
            },
          },
        },
        UpdateAgentSession: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            state: {
              type: 'string',
              enum: ['created', 'planning', 'preview_ready', 'awaiting_approval', 'applying', 'applied', 'failed'],
            },
            messages: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AgentMessage',
              },
            },
            previewId: {
              type: 'string',
            },
            pr: {
              type: 'object',
            },
            steps: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AgentSessionStep',
              },
            },
          },
        },
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
      },
    },
    security: [
      {
        nextAuth: [],
      },
    ],
  },
  // API route files to scan for documentation
  apis: [
    './src/app/api/**/*.ts',
  ],
};

/**
 * Generate OpenAPI specification from JSDoc comments in API routes.
 * 
 * @returns OpenAPI 3.0 specification object
 */
export function generateOpenAPISpec(): object {
  return swaggerJsdoc(options);
}

/**
 * Get OpenAPI specification as JSON string.
 * 
 * @returns JSON string of OpenAPI specification
 */
export function getOpenAPISpecJSON(): string {
  const spec = generateOpenAPISpec();
  return JSON.stringify(spec, null, 2);
}
