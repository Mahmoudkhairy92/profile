import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { restoreGitHubPagesRedirect } from './app/core/github-pages-redirect';

// Restore deep links (with query string and hash) forwarded by 404.html before the router starts.
restoreGitHubPagesRedirect(window);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
