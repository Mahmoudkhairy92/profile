import { claimChunkReload, isChunkLoadError } from './chunk-load-recovery';

function createStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe('isChunkLoadError', () => {
  it('should detect Chromium dynamic import failures', () => {
    expect(
      isChunkLoadError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://example.com/profile/chunk-ABC.js'
        )
      )
    ).toBe(true);
  });

  it('should detect Firefox dynamic import failures', () => {
    expect(
      isChunkLoadError(
        new TypeError('error loading dynamically imported module: https://example.com/chunk-ABC.js')
      )
    ).toBe(true);
  });

  it('should detect Safari dynamic import failures', () => {
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
  });

  it('should ignore unrelated navigation errors', () => {
    expect(isChunkLoadError(new Error('Cannot match any routes'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
  });
});

describe('claimChunkReload', () => {
  it('should allow the first reload attempt', () => {
    expect(claimChunkReload(createStorage())).toBe(true);
  });

  it('should never allow another reload in the same tab session', () => {
    const storage = createStorage();
    expect(claimChunkReload(storage)).toBe(true);
    for (let attempt = 0; attempt < 5; attempt++) {
      expect(claimChunkReload(storage)).toBe(false);
    }
  });

  it('should not reload when storage throws', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(claimChunkReload(storage)).toBe(false);
  });

  it('should not reload when storage does not keep the marker', () => {
    const storage: Pick<Storage, 'getItem' | 'setItem'> = {
      getItem: () => null,
      setItem: () => undefined,
    };
    expect(claimChunkReload(storage)).toBe(false);
  });

  it('should not reload when storage is null', () => {
    expect(claimChunkReload(null as unknown as Storage)).toBe(false);
  });
});
