import {Injectable} from '@angular/core';

import {environment} from '../../../../environments/environment';

import {File, IWriteOptions, DirectoryEntry, RemoveResult} from '@ionic-native/file/ngx';

// Resources and utils
import {Resources} from '../../core/utils/resources';
import {Converter} from '../../core/utils/utils';

@Injectable({
    providedIn: 'root'
})
export class LocalFilesService {

    constructor(private file: File) {

    }

    writeFile(imgURI: string): Promise<{}> {
        if (environment.cordova) {
            return this.writeFileCordova(imgURI);
        } else {
            return this.writeFilePWA(imgURI);
        }
    }

    readFile(imgURI: string): Promise<{}> {
        if (environment.cordova) {
            return this.readFileCordova(imgURI);
        } else {
            return this.readFilePWA(imgURI);
        }
    }

    removeDir(): Promise<{}> {
        if (environment.cordova) {
            return this.removeDirCordova();
        } else {
            return new Promise((resolve) => {
                resolve();
            });
        }
    }

    private writeFileCordova(imgURI: string): Promise<{}> {

        const fs: string = cordova.file.cacheDirectory;

        return new Promise((resolve, reject) => {
            this.file.resolveDirectoryUrl(fs).then((rootDir: DirectoryEntry) => {
                this.createSubdir(rootDir).then(() => {

                    const writeOptions: IWriteOptions = {
                        replace: true,
                        append: false
                    };

                    const localImgName: string = '' + Date.now() + Resources.Constants.PHOTO.IMG_EXTENSION;

                    this.file.writeFile(rootDir.nativeURL + Resources.Constants.PHOTO.LOCAL_SUB_PATH + '/',
                        localImgName, Converter.dataURItoBlob(imgURI), writeOptions).then(() => {
                        resolve(rootDir.nativeURL + Resources.Constants.PHOTO.LOCAL_SUB_PATH + '/' + localImgName);
                    }, (err: any) => {
                        reject(new Error('File could not be written.'));
                    }).catch((error: any) => {
                        reject(new Error('File could not be written.'));
                    });
                }, (err: Error) => {
                    reject(err);
                });
            }, (errRoot: any) => {
                reject(new Error('Root directory not found.'));
            });
        });
    }

    private writeFilePWA(imgURI: string): Promise<string> {
        return new Promise((resolve) => {
            resolve(imgURI);
        });
    }

    private createSubdir(rootDir: DirectoryEntry): Promise<{}> {
        return new Promise((resolve, reject) => {
            rootDir.getDirectory(Resources.Constants.PHOTO.LOCAL_SUB_PATH, {create: true}, (newDir: DirectoryEntry) => {
                resolve();
            }, (err: any) => {
                reject(new Error('Directory not found or not created.'));
            });
        });
    }

    private readFileCordova(localImgURI: string): Promise<{}> {
        return new Promise((resolve, reject) => {
            const path: string = localImgURI.substring(0, localImgURI.lastIndexOf('/') + 1);
            const fileName: string = localImgURI.substring(localImgURI.lastIndexOf('/') + 1, localImgURI.length);

            this.file.readAsArrayBuffer(path, fileName).then((result: ArrayBuffer) => {
                const blob: Blob = new Blob([new Uint8Array(result)], {type: Resources.Constants.PHOTO.MIME_TYPE});
                resolve(blob);
            }, (err: any) => {
                reject(new Error('File not found.'));
            });
        });
    }

    private removeDirCordova(): Promise<{}> {

        const fs: string = cordova.file.cacheDirectory;

        return new Promise((resolve, reject) => {
            this.file.resolveDirectoryUrl(fs).then((rootDir: DirectoryEntry) => {

                this.file.removeRecursively(rootDir.nativeURL, Resources.Constants.PHOTO.LOCAL_SUB_PATH).then((result: RemoveResult) => {
                    resolve();
                }, (err: any) => {
                    reject(new Error('Directory could not be removed.'));
                });
            }, (errRoot: any) => {
                reject(new Error('Root directory not found.'));
            });
        });
    }

    private readFilePWA(imgURI: string): Promise<{}> {
        return new Promise((resolve) => {
            const result: Blob = Converter.dataURItoBlob(imgURI);
            resolve(result);
        });
    }
}
