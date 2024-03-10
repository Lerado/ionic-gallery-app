import { Component, OnInit } from '@angular/core';
import { toSignal } from "@angular/core/rxjs-interop";
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol, IonImg } from '@ionic/angular/standalone';
import { PhotoService } from '../services/photo.service';
import { camera } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    standalone: true,
    imports: [IonImg, IonCol, IonRow, IonGrid, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton]
})
export class Tab2Page implements OnInit {

    photos = toSignal(this._photoService.photos$, { requireSync: true });

    /**
     * Constructor
     */
    constructor(
        private readonly _photoService: PhotoService
    ) {
        // Register icons
        addIcons({ camera });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Load saved photos
        this._photoService.load().subscribe();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Add photo to gallery
     */
    addPhotoToGallery(): void {
        this._photoService
            .snap()
            .subscribe();
    }
}
