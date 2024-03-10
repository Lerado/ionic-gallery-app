import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    standalone: true,
    imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class Tab1Page { }
