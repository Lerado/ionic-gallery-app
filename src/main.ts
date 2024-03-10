import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { appConfig } from './app/app.config';

if (environment.production) {
  enableProdMode();
}

// Run this before application bootstrap
defineCustomElements(window);

bootstrapApplication(AppComponent, appConfig);
