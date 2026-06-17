import type { FohTestQuestion } from './menuTypes';
import { serviceStaffQuestions, serverAssistantQuestions } from './fohTestData';

export interface QuestionsValidationResult {
  ok: boolean;
  errors: string[];
  count: number;
  duplicateIds: number[];
  missingIds: number[];
  outOfRangeIds: number[];
  wrongTestType: number[];
}

export interface ValidateOptions {
  /** Expected total entries. If omitted, count check is skipped. */
  expectedCount?: number;
  /** Expected testType value for every entry. */
  expectedTestType?: string;
  /** If true, treat any gap in the id sequence (min..max) as a missing id. */
  requireContiguousIds?: boolean;
}

/**
 * Validates a question bank for:
 *  - duplicate ids
 *  - missing ids (gaps in 1..max when requireContiguousIds)
 *  - non-positive / non-integer ids
 *  - mismatched testType
 *  - expected total count
 */
export function validateQuestionBank(
  questions: FohTestQuestion[],
  label: string,
  options: ValidateOptions = {}
): QuestionsValidationResult {
  const errors: string[] = [];
  const seen = new Map<number, number>();
  const duplicateIds: number[] = [];
  const outOfRangeIds: number[] = [];
  const wrongTestType: number[] = [];

  for (const q of questions) {
    if (!Number.isInteger(q.id) || q.id <= 0) {
      outOfRangeIds.push(q.id);
      continue;
    }
    seen.set(q.id, (seen.get(q.id) ?? 0) + 1);
    if (options.expectedTestType && q.testType !== options.expectedTestType) {
      wrongTestType.push(q.id);
    }
  }

  for (const [id, n] of seen) {
    if (n > 1) duplicateIds.push(id);
  }
  duplicateIds.sort((a, b) => a - b);

  const ids = [...seen.keys()].sort((a, b) => a - b);
  const missingIds: number[] = [];
  if (options.requireContiguousIds && ids.length > 0) {
    const max = ids[ids.length - 1];
    for (let i = 1; i <= max; i++) {
      if (!seen.has(i)) missingIds.push(i);
    }
  }

  if (duplicateIds.length) {
    errors.push(`${label}: duplicate ids -> ${duplicateIds.join(', ')}`);
  }
  if (missingIds.length) {
    errors.push(`${label}: missing ids -> ${missingIds.join(', ')}`);
  }
  if (outOfRangeIds.length) {
    errors.push(`${label}: invalid (non-positive / non-integer) ids -> ${outOfRangeIds.join(', ')}`);
  }
  if (wrongTestType.length) {
    errors.push(
      `${label}: entries with wrong testType (expected "${options.expectedTestType}") -> ${wrongTestType.join(', ')}`
    );
  }
  if (typeof options.expectedCount === 'number' && questions.length !== options.expectedCount) {
    errors.push(
      `${label}: expected ${options.expectedCount} entries, found ${questions.length}`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    count: questions.length,
    duplicateIds,
    missingIds,
    outOfRangeIds,
    wrongTestType,
  };
}

/** Expected counts kept here as the single source of truth. */
export const EXPECTED_COUNTS = {
  serviceStaffQuestions: 99,
  serverAssistantQuestions: 23,
} as const;

export function validateAllFohQuestionBanks(): QuestionsValidationResult[] {
  return [
    validateQuestionBank(serviceStaffQuestions, 'serviceStaffQuestions', {
      expectedCount: EXPECTED_COUNTS.serviceStaffQuestions,
      expectedTestType: 'service_staff',
      // ids 14 and 18 are intentionally removed, so we do NOT require contiguous ids.
      requireContiguousIds: false,
    }),
    validateQuestionBank(serverAssistantQuestions, 'serverAssistantQuestions', {
      expectedCount: EXPECTED_COUNTS.serverAssistantQuestions,
      expectedTestType: 'server_assistant',
      requireContiguousIds: false,
    }),
  ];
}

// Run once at import time in development so regressions surface immediately.
if (import.meta.env?.DEV) {
  const results = validateAllFohQuestionBanks();
  for (const r of results) {
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.error('[fohTestData validation]', r.errors.join(' | '));
    }
  }
}
