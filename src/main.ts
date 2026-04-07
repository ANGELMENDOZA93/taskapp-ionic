import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

const bootstrap = () =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));

if ((window as any)['cordova']) {
  document.addEventListener('deviceready', bootstrap, false);
} else {
  bootstrap();
}
