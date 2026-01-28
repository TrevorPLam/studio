/**
 * ============================================================================
 * PREVIEW PAYLOADS DATABASE MODULE
 * ============================================================================
 *
 * @file src/lib/db/previews.ts
 * @module previews
 * @epic RA-PREV-003
 *
 * PURPOSE:
 * Server-side persistence layer for preview payloads with CRUD operations.
 * Implements RA-10: Persist preview payload linked to session
 *
 * FEATURES:
 * - Preview creation and retrieval
 * - Session-based preview lookup
 * - Automatic timestamping
 * - User isolation
 *
 * RELATED FILES:
 * - src/lib/agent/proposed-change.ts (Preview payload types)
 * - src/app/api/sessions/[id]/preview/route.ts (Preview API endpoint)
 * - src/lib/db/agent-sessions.ts (Session persistence)
 *
 * STORAGE:
 * - File-based JSON storage in .data/previews.json
 * - In-memory cache for performance
 *
 * ============================================================================
 */

import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import type { PreviewPayload } from '@/features/agents';
import { assertNotKilled } from '@/lib/ops/killswitch';

// ============================================================================
// SECTION: STORAGE CONFIGURATION
// ============================================================================

/** Path to the previews data file */
const DATA_DIR = path.join(process.cwd(), '.data');
const PREVIEWS_FILE = path.join(DATA_DIR, 'previews.json');

/** In-memory cache of preview payloads */
let previewsCache: Map<string, PreviewPayload> | null = null;

/** Write queue to prevent concurrent writes */
let writeQueue: Promise<void> = Promise.resolve();

// ============================================================================
// SECTION: FILE OPERATIONS
// ============================================================================

/**
 * Ensure data directory exists.
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Load previews from file into cache.
 */
async function loadPreviews(): Promise<Map<string, PreviewPayload>> {
  if (previewsCache) {
    return previewsCache;
  }

  try {
    const data = await fs.readFile(PREVIEWS_FILE, 'utf-8');
    const previews = JSON.parse(data) as PreviewPayload[];
    previewsCache = new Map(previews.map((p) => [p.id!, p]));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist yet, start with empty cache
      previewsCache = new Map();
    } else {
      throw new Error(
        `Failed to load previews: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return previewsCache;
}

/**
 * Save previews from cache to file.
 */
async function savePreviews(): Promise<void> {
  await ensureDataDir();

  if (!previewsCache) {
    throw new Error('Previews cache not initialized');
  }

  const previews = Array.from(previewsCache.values());
  await fs.writeFile(PREVIEWS_FILE, JSON.stringify(previews, null, 2), 'utf-8');
}

/**
 * Queue a write operation to prevent concurrent writes.
 */
function queueWrite(operation: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(operation, operation);
  return writeQueue;
}

// ============================================================================
// SECTION: CRUD OPERATIONS
// ============================================================================

/**
 * Create a new preview payload.
 * Implements RA-10: Persist preview payload linked to session
 *
 * @param payload - Preview payload to create (without id)
 * @returns Created preview with generated id
 *
 * @example
 * ```typescript
 * const preview = await createPreview({
 *   sessionId: 'session-123',
 *   plan: ['Step 1', 'Step 2'],
 *   changes: [{ path: 'file.txt', action: 'create', after: 'content' }],
 *   diffs: [{ path: 'file.txt', unified: '...', addedLines: 1, removedLines: 0 }],
 *   stats: { files: 1, addedChars: 7, removedChars: 0, created: 1, updated: 0, deleted: 0 },
 *   createdAt: new Date().toISOString()
 * });
 * console.log(preview.id); // Generated UUID
 * ```
 */
export async function createPreview(payload: Omit<PreviewPayload, 'id'>): Promise<PreviewPayload> {
  assertNotKilled();

  const preview: PreviewPayload = {
    ...payload,
    id: randomUUID(),
    createdAt: payload.createdAt || new Date().toISOString(),
  };

  await queueWrite(async () => {
    const previews = await loadPreviews();
    previews.set(preview.id!, preview);
    await savePreviews();
  });

  return preview;
}

/**
 * Get a preview by ID.
 *
 * @param previewId - Preview ID
 * @returns Preview payload or null if not found
 */
export async function getPreview(previewId: string): Promise<PreviewPayload | null> {
  const previews = await loadPreviews();
  return previews.get(previewId) || null;
}

/**
 * Get preview by session ID.
 * Returns the most recent preview for the session.
 *
 * @param sessionId - Session ID
 * @returns Preview payload or null if not found
 */
export async function getPreviewBySession(sessionId: string): Promise<PreviewPayload | null> {
  const previews = await loadPreviews();

  // Find all previews for this session
  const sessionPreviews = Array.from(previews.values()).filter((p) => p.sessionId === sessionId);

  if (sessionPreviews.length === 0) {
    return null;
  }

  // Return the most recent one
  sessionPreviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return sessionPreviews[0];
}

/**
 * List all previews for a session.
 *
 * @param sessionId - Session ID
 * @returns Array of preview payloads
 */
export async function listPreviewsBySession(sessionId: string): Promise<PreviewPayload[]> {
  const previews = await loadPreviews();

  return Array.from(previews.values())
    .filter((p) => p.sessionId === sessionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Delete a preview by ID.
 *
 * @param previewId - Preview ID
 * @returns True if deleted, false if not found
 */
export async function deletePreview(previewId: string): Promise<boolean> {
  assertNotKilled();

  let deleted = false;

  await queueWrite(async () => {
    const previews = await loadPreviews();
    deleted = previews.delete(previewId);
    if (deleted) {
      await savePreviews();
    }
  });

  return deleted;
}

/**
 * Delete all previews for a session.
 *
 * @param sessionId - Session ID
 * @returns Number of previews deleted
 */
export async function deletePreviewsBySession(sessionId: string): Promise<number> {
  assertNotKilled();

  let deletedCount = 0;

  await queueWrite(async () => {
    const previews = await loadPreviews();
    const previewsToDelete = Array.from(previews.values()).filter((p) => p.sessionId === sessionId);

    for (const preview of previewsToDelete) {
      previews.delete(preview.id!);
      deletedCount++;
    }

    if (deletedCount > 0) {
      await savePreviews();
    }
  });

  return deletedCount;
}
