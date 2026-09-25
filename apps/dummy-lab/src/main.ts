import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

void bootstrapApplication(App, appConfig).catch((error: unknown) => {
  console.error('Application startup failed.', error);

  const root = document.querySelector('dl-root');
  const startupError = document.createElement('main');
  startupError.setAttribute('role', 'alert');
  startupError.style.cssText = 'font-family: system-ui, sans-serif; margin: 2rem; max-width: 42rem;';

  const heading = document.createElement('h1');
  heading.textContent = 'Application configuration unavailable';
  const message = document.createElement('p');
  message.textContent = 'The application could not load its runtime configuration. Refresh the page or contact support.';
  startupError.append(heading, message);

  root?.replaceWith(startupError);
});
