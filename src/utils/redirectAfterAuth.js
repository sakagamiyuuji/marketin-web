/**
 * @param {{ from?: string | { pathname?: string } } | undefined} state
 */
export function redirectAfterAuthPath(state) {
  const f = state?.from;
  if (typeof f === 'string' && f.startsWith('/')) return f;
  if (f && typeof f === 'object' && typeof f.pathname === 'string' && f.pathname.startsWith('/')) {
    return f.pathname;
  }
  return '/';
}
