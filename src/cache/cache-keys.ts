/**
 * Cache keys. Published curriculum content is the same for every learner, so it
 * is cached under global keys (`curr:g:*`) and dropped when a release is
 * activated. Per-learner state (enrollment, completions) uses user keys
 * (`curr:u:<id>:*`) and is dropped by `invalidateUser`.
 */
export const cacheKeys = {};

export const userCachePattern = (userLoginId: string): string =>
    `curr:u:${userLoginId}:*`;
