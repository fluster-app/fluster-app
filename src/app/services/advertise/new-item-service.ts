import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {WebView} from '@ionic-native/ionic-webview/ngx';

// Model
import {Item} from '../model/item/item';
import {Appointment} from '../model/appointment/appointment';
import {Photo} from '../model/utils/photo';
import {Reward} from '../model/reward/reward';

// Resources and utils
import {Resources} from '../core/utils/resources';
import {Comparator} from '../core/utils/utils';

// Services
import {S3UploadService} from '../core/amazon/s3-upload-service';
import {AdsService} from './ads-service';
import {AppointmentService} from '../core/appointment/appointment-service';
import {AccessTokenBody, AccessTokenService} from '../core/user/access-token-service';
import {UserSessionService} from '../core/user/user-session-service';
import {StorageService} from '../core/localstorage/storage-service';
import {NewItemRecovery} from '../model/utils/new-item-recovery';
import {RewardService} from '../core/reward/reward-service';

@Injectable({
    providedIn: 'root'
})
export class NewItemService {

    private newItem: Item;

    private newAppointment: Appointment;
    private newAppointmentSchedule: number[];

    private photos: Photo[];

    private edit: boolean = false;
    private activation: boolean = false;
    private done: boolean = false;

    private reward: Reward;

    private androidPhotoRecoveryURI: string;

    constructor(private httpClient: HttpClient,
                private webView: WebView,
                private s3UploadService: S3UploadService,
                private adsService: AdsService,
                private appointmentService: AppointmentService,
                private userSessionService: UserSessionService,
                private accessTokenService: AccessTokenService,
                private storageService: StorageService,
                private rewardService: RewardService) {

    }

    getNewItem(): Item {
        return this.newItem;
    }

    setNewItem(item: Item) {
        this.newItem = item;
    }

    getNewAppointment(): Appointment {
        return this.newAppointment;
    }

    setNewAppointment(appointment: Appointment) {
        this.newAppointment = appointment;
    }

    setNewAppointmentSchedule(schedule: number[]) {
        this.newAppointmentSchedule = schedule;
    }

    getPhotos(): Photo[] {
        return this.photos;
    }

    setPhotos(photos: Photo[]) {
        this.photos = photos;
    }

    getReward(): Reward {
        return this.reward;
    }

    popAndroidPhotoRecoveryURI(): string {
        const result: string = this.androidPhotoRecoveryURI;
        this.androidPhotoRecoveryURI = null;
        return result;
    }

    pushAndroidPhotoRecoveryURI(photoRecoveryURI: string) {
        this.androidPhotoRecoveryURI = this.webView.convertFileSrc(photoRecoveryURI);
    }

    hasPendingAndroidPhotoRecoveryURI(): boolean {
        return !Comparator.isStringEmpty(this.androidPhotoRecoveryURI);
    }

    init() {
        this.done = false;

        this.edit = false;

        this.newItem = new Item();
        this.newAppointment = null;

        this.initPhotos();

        this.newItem.user = this.userSessionService.getUser();
    }

    recover(): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.storageService.getNewItemRecovery().then((recovery: NewItemRecovery) => {
                if (Comparator.isEmpty(recovery)) {
                    reject(new Error('No item to recover'));
                } else {
                    this.done = false;

                    this.edit = recovery.edit;

                    this.newItem = recovery.newItem ? recovery.newItem : new Item();
                    this.newAppointment = recovery.newAppointment ? recovery.newAppointment : null;

                    this.initPhotos();

                    if (Comparator.hasElements(recovery.photos)) {
                        for (let i: number = 0; i < recovery.photos.length; i++) {
                            if (recovery.photos[i]) {
                                this.photos[i] = recovery.photos[i];
                            }
                        }
                    }

                    this.newItem.user = this.userSessionService.getUser();

                    this.storageService.removeNewItemRecovery().then(() => {
                        resolve();
                    });
                }
            });
        });
    }

    load(item: Item, appointment: Appointment) {
        this.done = false;

        this.edit = true;

        // Full new copy. Try to save references memory and doesn't show change if user comeback without commit
        this.newItem = JSON.parse(JSON.stringify(item));
        this.newAppointment = JSON.parse(JSON.stringify(appointment));

        this.initPhotos();

        this.photos[0] = new Photo(Resources.Constants.AWS.S3_URL +
            '/' + item.source + '/' + item.hashId + '/' + this.newItem.mainPhoto, 0, false);

        if (!Comparator.isEmpty(this.newItem.itemDetail.otherPhotos)) {
            for (let i: number = 0; i < this.newItem.itemDetail.otherPhotos.length; i++) {
                this.photos[i + 1] = new Photo(Resources.Constants.AWS.S3_URL + '/'
                    + item.source + '/' + item.hashId + '/' + this.newItem.itemDetail.otherPhotos[i], i + 1, false);
            }
        }

        // No reward when edit
        this.reward = null;
    }

    isEdit(): boolean {
        return this.edit;
    }

    isActivation(): boolean {
        return this.activation;
    }

    isDone(): boolean {
        return this.done;
    }

    private initPhotos() {
        this.photos = new Array<Photo>(Resources.Constants.PHOTO.ARRAY_SIZE);
    }

    saveNewItem(): Promise<{}> {
        if (this.edit) {
            return this.update();
        } else {
            return this.post();
        }
    }

    private post(): Promise<{}> {
        return new Promise(async (resolve, reject) => {

            if (Comparator.isEmpty(this.newItem) ||
                Comparator.isEmpty(this.photos) ||
                Comparator.isEmpty(this.newAppointment)) {

                reject();
            } else {
                try {
                    // 0. Clear _id to allow new inserts
                    delete this.newItem._id;
                    delete this.newAppointment._id;

                    const headers: HttpHeaders = new HttpHeaders();
                    headers.append('Content-Type', 'application/json');

                    const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                    body['newItem'] = this.newItem;

                    // 1. Add item
                    this.httpClient.post(Resources.Constants.API.ITEMS, body, {headers: headers})
                        .subscribe((postedItem: Item) => {
                            this.newAppointment.item = postedItem;

                            // 2. Schedule
                            this.schedule().then((postedAppointment: Appointment) => {

                                // 3. Add photos
                                // posteItem is not populated
                                this.uploadPhotos(postedItem.hashId, this.newItem.mainPhoto, this.newItem.itemDetail.otherPhotos).then(() => {

                                    // 4. All good, set item as published
                                    this.adsService.setStatus(postedItem._id, Resources.Constants.ITEM.STATUS.PUBLISHED)
                                        .then((updatedItem: Item) => {
                                            this.newItem = updatedItem;
                                            this.newAppointment = postedAppointment;
                                            this.done = true;

                                            this.createReward().then((result: Reward) => {
                                                this.reward = result;
                                                resolve();
                                            });
                                        }, (errorResponse: HttpErrorResponse) => {
                                            reject(errorResponse);
                                        });
                                }, (errorResponse: HttpErrorResponse) => {
                                    reject(errorResponse);
                                });

                            }, (errorResponse: HttpErrorResponse) => {
                                reject(errorResponse);
                            });
                        }, (errorResponse: HttpErrorResponse) => {
                            reject(errorResponse);
                        });

                } catch (err) {
                    reject(err);
                }

            }

        });
    }

    private uploadPhotos(hashId: string, mainPhoto: string, otherPhotos: string[]): Promise<{}> {

        return new Promise((resolve, reject) => {
            const promises = new Array();

            for (let i: number = 0; i < this.photos.length; i++) {
                if (this.photos[i] != null && this.photos[i].newPhoto) {
                    const imgName: string = i === 0 ? mainPhoto : otherPhotos[i - 1];
                    const dir = Resources.Constants.ITEM.SOURCE + '/' + hashId + '/';

                    const fullPathImgName = dir + imgName;

                    promises.push(this.s3UploadService.upload(fullPathImgName, this.photos[i].imgURI));
                }
            }

            //removeIf(production)
            if (promises.length === 0) {
                promises.push(this.s3UploadService.uploadMockup());
            }
            //endRemoveIf(production)

            if (promises.length === 0) {
                if (this.edit) {
                    // It's possible that no photos were updated
                    resolve();
                } else {
                    // If post, at least one image is mandatory
                    reject();
                }
            } else {
                forkJoin(promises).subscribe(
                    (data: string[]) => {
                        resolve();
                    },
                    (err: any) => {
                        reject(err);
                    }
                );
            }
        });
    }

    private schedule(): Promise<{}> {

        return new Promise((resolve, reject) => {
            this.appointmentService.extractSchedule(this.newAppointment, this.newAppointmentSchedule).then(async (appointment: Appointment) => {
                try {
                    this.newAppointment = appointment;

                    const headers: HttpHeaders = new HttpHeaders();
                    headers.append('Content-Type', 'application/json');

                    const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                    body['appointment'] = this.newAppointment;

                    this.httpClient.post(Resources.Constants.API.APPOINTMENTS, body, {headers: headers})
                        .subscribe((result: Appointment) => {
                            resolve(result);
                        }, (errorResponse: HttpErrorResponse) => {
                            reject(errorResponse);
                        });
                } catch (err) {
                    reject(err);
                }

            });
        });
    }

    private update(): Promise<{}> {

        return new Promise((resolve, reject) => {

            if (Comparator.isEmpty(this.newItem) ||
                Comparator.isEmpty(this.photos) ||
                Comparator.isEmpty(this.newAppointment)) {

                reject();
            } else {
                const promises = new Array();

                promises.push(this.updateSchedule());
                promises.push(this.uploadPhotos(this.newItem.hashId, this.newItem.mainPhoto, this.newItem.itemDetail.otherPhotos));

                forkJoin(promises).subscribe(
                    (data: HttpErrorResponse[]) => {
                        this.updateNewItem().then((updatedItem: Item) => {
                            this.newItem = updatedItem;
                            this.done = true;
                            resolve();
                        }, (errorResponse: HttpErrorResponse) => {
                            reject(errorResponse);
                        });
                    },
                    (err: any) => {
                        reject(err);
                    }
                );
            }
        });
    }

    private updateNewItem(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                const headers: HttpHeaders = new HttpHeaders();
                headers.append('Content-Type', 'application/json');

                const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
                body['item'] = this.newItem;

                this.httpClient.put(Resources.Constants.API.ITEMS + this.newItem._id, body, {headers: headers})
                    .subscribe((item: Item) => {
                        resolve(item);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    private updateSchedule(): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.appointmentService.updateAppointmentSchedule(this.newAppointment, this.newAppointmentSchedule)
                .then((appointment: Appointment) => {
                    this.newAppointment = appointment;

                    resolve(appointment);
                }, (errorResponse: HttpErrorResponse) => {
                    reject(errorResponse);
                });
        });
    }

    saveAndroidRecovery(): Promise<NewItemRecovery> {
        return this.storageService.saveNewItemRecovery({
            edit: this.edit,
            newItem: this.newItem,
            newAppointment: this.newAppointment,
            photos: this.photos
        });
    }

    private createReward(): Promise<Reward> {
        return new Promise((resolve) => {
            this.rewardService.createContestReward(this.newItem).then((createdReward: Reward) => {
                resolve(createdReward);
            }, (errorResponse: HttpErrorResponse) => {
                resolve(null);
            });
        });
    }
}
