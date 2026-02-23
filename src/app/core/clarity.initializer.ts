import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import Clarity from '@microsoft/clarity';

export interface AppConfig {
  clarityProjectId?: string;
}

export function clarityInitializer(http: HttpClient): () => Promise<void> {
  return () =>
    firstValueFrom(http.get<AppConfig>('config/config.json'))
      .then((config) => {
        if (config?.clarityProjectId) {
          Clarity.init(config.clarityProjectId);
        }
      })
      .catch(() => {
        // Config missing or invalid - Clarity will not be initialized
      });
}
