import { ApplicationConfig } from "@angular/core";
import { RouteReuseStrategy, provideRouter } from "@angular/router";
import { IonicRouteStrategy } from "@ionic/angular";
import { provideIonicAngular } from "@ionic/angular/standalone";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular(),
        provideRouter(routes),
    ],
}
