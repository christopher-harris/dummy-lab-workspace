import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {appRoutes} from './app.routes';
import {providePrimeNgPlatform} from '@dummy-lab/platform';
import {authInterceptor} from "@dummy-lab/data-access-auth";
import {provideRuntimeConfig} from '@dummy-lab/shared-runtime-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRuntimeConfig(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    providePrimeNgPlatform(),
  ],
};
