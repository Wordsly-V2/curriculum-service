/**
 * Published when curriculum items are archived. learning-service drops the
 * learners' FSRS progress for them. Payload: `{ itemIds: string[] }`.
 */
export const PATH_ITEMS_RETIRED_TOPIC = 'path_items_retired';

/**
 * Published after a learner's Path progress changes (a lesson completed, a
 * checkpoint passed, a placement taken). learning-service turns the totals
 * into achievements. Payload: `PathProgressEvent` (path-progress-events.ts).
 * Keyed by user, so one learner's events stay in order on a partition.
 */
export const PATH_PROGRESS_TOPIC = 'path_progress';
