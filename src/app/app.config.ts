import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { SocialAuthService, GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { SOCIAL_AUTH_CONFIG } from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),

    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '610797077240-hd26f06tg0k68v7hhtuoi5fdl76a50rf.apps.googleusercontent.com'
            ),
          },
        ],
        onError: (err: any) => console.error(err),
      } as SocialAuthServiceConfig,
    },
    SocialAuthService
  ]
};
