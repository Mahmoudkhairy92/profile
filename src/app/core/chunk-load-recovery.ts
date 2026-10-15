import { inject } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationError } from '@angular/router';

const RELOAD_ATTEMPTED_KEY = 'chunkLoadReloadAttempted';

// Messages browsers use when a dynamic import() cannot be fetched (Chromium, Firefox, Safari).
const CHUNK_LOAD_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return CHUNK_LOAD_ERROR_PATTERN.test(message);
}

/**
 * Allows at most one automatic reload per browser tab session. Returns false when a reload was
 * already attempted, or when storage is unavailable or does not keep the marker, so a chunk that
 * is genuinely missing can never cause a reload loop (regardless of how slowly pages load).
 */
export function claimChunkReload(storage: Pick<Storage, 'getItem' | 'setItem'>): boolean {
  try {
    if (storage.getItem(RELOAD_ATTEMPTED_KEY) !== null) {
      return false;
    }
    storage.setItem(RELOAD_ATTEMPTED_KEY, 'true');
    return storage.getItem(RELOAD_ATTEMPTED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Each deployment replaces the hashed lazy-route chunks, so a page loaded before the deployment
 * requests chunk files that no longer exist and the navigation fails silently. Reload the target
 * URL once per tab session so the browser picks up the current build.
 */
export function chunkLoadErrorHandler(event: NavigationError): void {
  if (!isChunkLoadError(event.error)) {
    return;
  }
  const location = inject(Location);
  let storage: Storage;
  try {
    storage = window.sessionStorage;
  } catch {
    return;
  }
  if (claimChunkReload(storage)) {
    window.location.assign(location.prepareExternalUrl(event.url));
  }
}
