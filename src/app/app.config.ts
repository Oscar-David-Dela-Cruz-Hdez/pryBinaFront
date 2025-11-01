import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';

//import { provideGoogleSso } from '@angular/google-signin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withFetch()
    ),

  /*  provideGoogleSso({
      provider: '610797077240-hd26f06tg0k68v7hhtuoi5fdl76a50rf.apps.googleusercontent.com'
    })*/

  ]
};
