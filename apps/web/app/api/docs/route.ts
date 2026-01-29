/**
 * ============================================================================
 * OPENAPI DOCUMENTATION ENDPOINT
 * ============================================================================
 *
 * @file src/app/api/docs/route.ts
 * @module api/docs
 * @epic BP-DOC-009
 *
 * PURPOSE:
 * Serves OpenAPI 3.0 specification and Swagger UI for interactive API documentation.
 *
 * ENDPOINTS:
 * - GET /api/docs - Serves Swagger UI HTML
 * - GET /api/docs?format=json - Returns OpenAPI spec as JSON
 *
 * RELATED FILES:
 * - src/lib/api-docs/openapi.ts (OpenAPI spec generator)
 *
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateOpenAPISpec } from '@/lib/api-docs/openapi';

/**
 * GET /api/docs
 * 
 * Serves OpenAPI specification and Swagger UI.
 * 
 * Query parameters:
 * - format=json: Returns OpenAPI spec as JSON instead of Swagger UI
 * 
 * @openapi
 * /api/docs:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: Get API documentation
 *     description: Returns Swagger UI HTML or OpenAPI specification JSON
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json]
 *         description: Response format (default is HTML)
 *     responses:
 *       200:
 *         description: API documentation
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  // Generate OpenAPI spec
  const spec = generateOpenAPISpec();

  // Return JSON if requested
  if (format === 'json') {
    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Return Swagger UI HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Firebase Studio API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(spec)};
      
      window.ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
      });
    };
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; font-src 'self' data: https://unpkg.com; connect-src 'self' https:; frame-ancestors 'self';",
    },
  });
}
