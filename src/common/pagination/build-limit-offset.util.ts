const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

export interface LimitOffset {
  limit: number;
  offset: number;
}

export function buildLimitOffset(limit?: number, offset?: number): LimitOffset {
  const normalizedLimit =
    typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? Math.min(Math.floor(limit), MAX_LIMIT)
      : DEFAULT_LIMIT;

  const normalizedOffset =
    typeof offset === 'number' && Number.isFinite(offset) && offset >= 0
      ? Math.floor(offset)
      : DEFAULT_OFFSET;

  return {
    limit: normalizedLimit,
    offset: normalizedOffset,
  };
}
