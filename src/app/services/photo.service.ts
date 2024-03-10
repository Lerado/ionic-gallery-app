import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, concatAll, forkJoin, from, iif, map, of, switchMap, tap } from 'rxjs';
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { Directory, Filesystem } from '@capacitor/filesystem'
import { UserPhoto } from './photo.types';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class PhotoService {

    private readonly _photos = new BehaviorSubject<UserPhoto[]>([]);
    private readonly PHOTO_STORAGE: string = 'photos';

    /**
     * Constructor
     */
    constructor(
        private readonly _platform: Platform
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter and setter for photos
     */
    get photos$(): Observable<UserPhoto[]> {
        return this._photos.asObservable();
    }
    private set photos(photo: UserPhoto) {
        this._photos.next([
            photo,
            ...this._photos.getValue()
        ]);
        // Save in preferences
        Preferences.set({
            key: this.PHOTO_STORAGE,
            value: JSON.stringify(this._photos.getValue())
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load photos
     */
    load(): Observable<UserPhoto[]> {
        // Retrieve cached photo array data
        return from(
            Preferences.get({ key: this.PHOTO_STORAGE })
        )
            .pipe(
                // Parse JSON string
                map(({ value }) => (value ? JSON.parse(value) : []) as UserPhoto[]),
                // Display the photo by reading into base64 format
                switchMap((photos) => {
                    const obs = photos.map(photo => from(
                        Filesystem.readFile({
                            path: photo.filepath,
                            directory: Directory.Data
                        })
                    )
                        .pipe(
                            map(readFile => ({ ...photo, webviewPath: `data:image/jpeg;base64,${readFile.data}` }))
                        )
                    );
                    return forkJoin(obs);
                }),
                tap(result => this._photos.next(result as UserPhoto[]))
            )
    }

    /**
     * Snap a photo
     */
    snap(): Observable<UserPhoto> {
        return from(
            Camera.getPhoto({
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
                quality: 100
            })
        )
            .pipe(
                switchMap(photo => this._savePicture(photo)),
                tap(result => this.photos = result)
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Save picture
     *
     * @param photo
     */
    private _savePicture(photo: Photo): Observable<UserPhoto> {
        // Convert photo to base64 format, required by Filesystem API to save
        return this._readAsBase64(photo)
            .pipe(
                // Write the file to the data directory
                switchMap((base64Data) => {
                    const fileName = Date.now() + '.jpeg';
                    return from(
                        Filesystem.writeFile({
                            path: fileName,
                            data: base64Data,
                            directory: Directory.Data
                        })
                    )
                        .pipe(
                            // Use webPath to display the new image instead of base64 since it's
                            // already loaded into memory
                            map((savedFile) => {
                                if (this._platform.is('hybrid')) {
                                    // Display the new image by rewriting the 'file://' path to HTTP
                                    // Details: https://ionicframework.com/docs/building/webview#file-protocol
                                    return {
                                        filepath: savedFile.uri,
                                        webviewPath: Capacitor.convertFileSrc(savedFile.uri)
                                    }
                                }
                                return {
                                    filepath: fileName,
                                    webviewPath: photo.webPath
                                };
                            })
                        );
                })
            );
    }

    /**
     * Read as base64
     *
     * @param photo
     */
    private _readAsBase64(photo: Photo): Observable<string> {
        // Fetch the photo, read as a blob, then convert to base64 format
        return iif(
            () => this._platform.is('hybrid'),
            // On native runtime
            from(
                Filesystem.readFile({ path: photo.path! })
            )
                .pipe(
                    map(result => result.data as string)
                ),
            // On the web
            from(
                fetch(photo.webPath!)
            )
                .pipe(
                    switchMap(response => from(response.blob())),
                    switchMap(blob => from(
                        new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onerror = reject;
                            reader.onload = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        })
                    )),
                    map(result => result as string)
                )
        );
    }
}
