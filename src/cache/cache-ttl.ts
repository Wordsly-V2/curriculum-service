export enum CacheKind {
    /** Published release snapshots; invalidated when a release is activated. */
    Release = 'release',
    /** Per-learner path state (enrollment, completions). */
    LearnerState = 'learnerState',
}

/** TTL in seconds per cache kind. Writes invalidate; TTL is a safety net. */
export const CACHE_TTL_SECONDS: Record<CacheKind, number> = {
    [CacheKind.Release]: 24 * 60 * 60,
    [CacheKind.LearnerState]: 60 * 60,
};
