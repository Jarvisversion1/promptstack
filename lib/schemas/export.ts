import { z } from 'zod'

/* ------------------------------------------------------------------ */
/*  Schema for a single exported step                                  */
/* ------------------------------------------------------------------ */

export const exportedStepSchema = z.object({
  step_order: z.number().int().min(1),
  title: z.string().min(1),
  prompt_text: z.string(),
  context_mode: z.string(),
  output_summary: z.string(),
  tips: z.string().optional().default(''),
})

export const exportedStepsSchema = z.array(exportedStepSchema).min(1)

/* ------------------------------------------------------------------ */
/*  Inferred types                                                     */
/* ------------------------------------------------------------------ */

export type ExportedStep = z.infer<typeof exportedStepSchema>

/* ------------------------------------------------------------------ */
/*  Parse helper                                                       */
/* ------------------------------------------------------------------ */

type ParseSuccess = { success: true; data: ExportedStep[] }
type ParseFailure = { success: false; error: string }
export type ParseResult = ParseSuccess | ParseFailure

/**
 * Takes the raw string a user pastes from their AI tool, strips any
 * markdown fences, parses JSON, and validates the shape with Zod.
 */
export function parseExportJSON(raw: string): ParseResult {
  /* 1. Clean up the input ------------------------------------------ */
  let cleaned = raw.trim()

  if (!cleaned) {
    return { success: false, error: 'Input is empty — paste the JSON output from your AI tool.' }
  }

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/, '')
    cleaned = cleaned.replace(/\n?\s*```\s*$/, '')
    cleaned = cleaned.trim()
  }

  /* 2. Parse JSON -------------------------------------------------- */
  let parsed: unknown

  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return {
      success: false,
      error: 'Invalid JSON — make sure you copied the entire output from your AI tool.',
    }
  }

  /* 3. Handle common AI quirks ------------------------------------- */
  // Some models wrap the array in an object: { "steps": [...] }
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const values = Object.values(parsed as Record<string, unknown>)
    const arrayValue = values.find(Array.isArray)
    if (arrayValue) {
      parsed = arrayValue
    }
  }

  if (!Array.isArray(parsed)) {
    return {
      success: false,
      error: 'Expected a JSON array of steps, but got something else. Make sure the output starts with [ and ends with ].',
    }
  }

  if (parsed.length === 0) {
    return {
      success: false,
      error: 'The array is empty — no steps were found. Try running the export prompt again.',
    }
  }

  /* 4. Validate with Zod ------------------------------------------- */
  const result = exportedStepsSchema.safeParse(parsed)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Build a human-readable error from the first issue
  const issue = result.error.issues[0]
  if (issue) {
    const path = issue.path.join('.')
    const prefix = path ? `At ${path}: ` : ''
    return { success: false, error: `${prefix}${issue.message}` }
  }

  return { success: false, error: 'Validation failed — the data does not match the expected format.' }
}
