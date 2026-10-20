/** sessionStorage key written by public/404.html. */
export const GITHUB_PAGES_REDIRECT_KEY = 'redirect';

export interface RedirectHost {
  readonly sessionStorage: Pick<Storage, 'getItem' | 'removeItem'> | null;
  readonly history: Pick<History, 'replaceState'>;
}

/**
 * GitHub Pages serves 404.html for deep links. It stores the requested path, including the query
 * string and hash, in sessionStorage and loads the app root. Restore that exact path before the
 * router starts, so deep links and query parameters (e.g. ?utm_source=...) survive the redirect.
 * Returns the restored path, or null when there was nothing valid to restore.
 */
export function restoreGitHubPagesRedirect(host: RedirectHost): string | null {
  let redirect: string | null;
  try {
    const storage = host.sessionStorage;
    redirect = storage?.getItem(GITHUB_PAGES_REDIRECT_KEY) ?? null;
    storage?.removeItem(GITHUB_PAGES_REDIRECT_KEY);
  } catch {
    return null;
  }

  // Only same-origin absolute paths; never protocol-relative or absolute URLs.
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return null;
  }

  host.history.replaceState(null, '', redirect);
  return redirect;
}
