/**
 * Zod schemas for API validation
 * 
 * These schemas are used for runtime validation of API requests and responses.
 */

import { z } from "zod";

// Example schemas - add more as needed
export const sessionIdSchema = z.string().min(1);
export const agentIdSchema = z.string().min(1);
