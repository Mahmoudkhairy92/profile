import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withNavigationErrorHandler,
} from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { clarityInitializer } from './core/clarity.initializer';
import { chunkLoadErrorHandler } from './core/chunk-load-recovery';
import { HttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Emits the router's Scroll events; AppComponent performs the scrolling (top, #fragment, back/forward)
      withInMemoryScrolling(),
      withNavigationErrorHandler(chunkLoadErrorHandler)
    ),
    provideHttpClient(withFetch()),
    // Firebase (used only by the game's leaderboard) is provided on the lazily loaded game route
    {
      provide: APP_INITIALIZER,
      useFactory: clarityInitializer,
      multi: true,
      deps: [HttpClient],
    },
  ],
};
