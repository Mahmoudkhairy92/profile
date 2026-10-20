import { GITHUB_PAGES_REDIRECT_KEY, RedirectHost, restoreGitHubPagesRedirect } from './github-pages-redirect';

function createHost(stored: string | null) {
  const values = new Map<string, string>();
  if (stored !== null) {
    values.set(GITHUB_PAGES_REDIRECT_KEY, stored);
  }
  const replaced: string[] = [];
  const host: RedirectHost = {
    sessionStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => {
        values.delete(key);
      },
    },
    history: {
      replaceState: (_data: unknown, _unused: string, url?: string | URL | null) => {
        replaced.push(String(url));
      },
    },
  };
  return { host, values, replaced };
}

describe('restoreGitHubPagesRedirect', () => {
  it('should restore a deep link with its query string', () => {
    const { host, replaced } = createHost('/profile/projects?utm_source=linkedin');

    expect(restoreGitHubPagesRedirect(host)).toBe('/profile/projects?utm_source=linkedin');
    expect(replaced).toEqual(['/profile/projects?utm_source=linkedin']);
  });

  it('should preserve the hash fragment', () => {
    const { host, replaced } = createHost('/profile/projects?utm_source=linkedin#project-proj1');

    restoreGitHubPagesRedirect(host);

    expect(replaced).toEqual(['/profile/projects?utm_source=linkedin#project-proj1']);
  });

  it('should leave a direct visit with a query string untouched', () => {
    const { host, replaced } = createHost(null);

    expect(restoreGitHubPagesRedirect(host)).toBeNull();
    expect(replaced).toEqual([]);
  });

  it('should clear the stored redirect after reading it', () => {
    const { host, values } = createHost('/profile/experience');

    restoreGitHubPagesRedirect(host);

    expect(values.has(GITHUB_PAGES_REDIRECT_KEY)).toBe(false);
  });

  it('should ignore values that are not same-origin paths', () => {
    for (const value of ['//evil.example/path', 'https://evil.example/', 'profile/projects', '']) {
      const { host, replaced, values } = createHost(value);

      expect(restoreGitHubPagesRedirect(host)).toBeNull();
      expect(replaced).toEqual([]);
      expect(values.has(GITHUB_PAGES_REDIRECT_KEY)).toBe(false);
    }
  });

  it('should not throw when storage is unavailable', () => {
    const replaced: string[] = [];
    const history = { replaceState: (_d: unknown, _u: string, url?: string | URL | null) => { replaced.push(String(url)); } };
    const throwingHost = {
      get sessionStorage(): Storage {
        throw new Error('SecurityError');
      },
      history,
    } as RedirectHost;

    expect(restoreGitHubPagesRedirect(throwingHost)).toBeNull();
    expect(restoreGitHubPagesRedirect({ sessionStorage: null, history })).toBeNull();
    expect(replaced).toEqual([]);
  });
});
