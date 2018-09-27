import {Component, Input, Output, EventEmitter} from '@angular/core';
import {LoadingController, PopoverController, ToastController} from '@ionic/angular';
import {HttpErrorResponse} from '@angular/common/http';

import {forkJoin} from 'rxjs';

import {TranslateService} from '@ngx-translate/core';

// Abstract
import {AbstractItemsPage} from '../../../pages/browse/items/abstract-items';

// Model
import {Item} from '../../../services/model/item/item';
import {User} from '../../../services/model/user/user';
import {Applicant, ApplicantAgenda} from '../../../services/model/appointment/applicant';
import {Notification} from '../../../services/model/notification/notification';
import {ItemUser} from '../../../services/model/item/item-user';
import {InitScheduledDates} from '../../../services/core/appointment/item-appointment-service';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {AppointmentService} from '../../../services/core/appointment/appointment-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {NotificationService} from '../../../services/core/notification/notification-service';
import {ItemUsersService} from '../../../services/browse/item-users-service';
import {LikeService} from '../../../services/browse/like-service';
import {SubscriptionService} from '../../../services/core/user/subscription-service';
import {StorageService} from '../../../services/core/localstorage/storage-service';

@Component({
    templateUrl: 'pick-item-appointments.html',
    selector: 'app-pick-item-appointments'
})
export class PickItemAppointmentsComponent extends AbstractItemsPage {

    @Output() notifiyScheduled: EventEmitter<void> = new EventEmitter<void>();
    @Output() notifyhasFavoritesDates: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Input() item: Item;
    @Input() itemUser: ItemUser;
    @Input() existingApplicant: Applicant;
    @Input() alreadyBookmarked: boolean;

    @Input() initScheduledDates: InitScheduledDates;

    user: User;

    selectedAppointmentStartTimes: number[];

    constructor(private toastController: ToastController,
                protected popoverController: PopoverController,
                private loadingController: LoadingController,
                private translateService: TranslateService,
                protected itemUsersService: ItemUsersService,
                private notificationService: NotificationService,
                private likeService: LikeService,
                private appointmentService: AppointmentService,
                private userSessionService: UserSessionService,
                private subscriptionService: SubscriptionService,
                private storageService: StorageService) {

        super(popoverController, itemUsersService);

        this.user = this.userSessionService.getUser();
    }

    schedule(selectedAppointmentStartTimes: number[]) {
        this.selectedAppointmentStartTimes = selectedAppointmentStartTimes;

        this.subscriptionService.couldAddLike().then(async (result: boolean) => {
            if (result) {
                await this.initAndDoSchedule();
            } else {
                await this.showProductModal(this.doProductCallback);
            }
        });
    }

    private doProductCallback = () => {
        this.initAndDoSchedule();
    }

    private async initAndDoSchedule() {
        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            this.doSchedule().then(async () => {
                this.notifiyScheduled.emit();
                await loading.dismiss();
            }, async (error: HttpErrorResponse) => {
                await loading.dismiss();
                await this.errorMsg(this.toastController, this.translateService, 'ERRORS.ITEMS.ACTION_ERROR');
            });
        });
    }

    private doSchedule(): Promise<{}> {
        return new Promise((resolve, reject) => {
            const promise = this.hasExistingApplicant() ? this.updateWithNewSchedule() : this.createNewSchedule();

            promise.then(async () => {
                await this.savePrefillItemAppointmentsStartTimes();

                resolve();
            }, (errorResponse: HttpErrorResponse) => {
                reject(errorResponse);
            });
        });
    }

    private savePrefillItemAppointmentsStartTimes(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            try {
                const concatenedPrefill: number[] = Array.from(new Set([
                    ...this.initScheduledDates.previousSelectedAppointmentsStartTimes,
                    ...this.selectedAppointmentStartTimes]));

                await this.storageService.savePrefillItemAppointmentsStartTimes(concatenedPrefill);
            } catch (err) {
                // We could ignore this error, better if it works but what really matters have been done
            }

            resolve();
        });
    }

    private updateWithNewSchedule(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            const applicant: Applicant = await this.buildAppointmentApplicant();

            this.appointmentService.updateApplicant(applicant).then((data: Applicant) => {
                this.notificationAndInterests(applicant, false).then(() => {
                    resolve();
                });
            }, (errorResponse: HttpErrorResponse) => {
                reject(errorResponse);
            });
        });
    }

    private createNewSchedule(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            const applicant: Applicant = await this.buildAppointmentApplicant();

            this.appointmentService.createApplicant(applicant).then((data: Applicant) => {
                // Appointment added, like item
                this.like(data).then(() => {
                    resolve();
                }, (error: HttpErrorResponse) => {
                    reject(error);
                });
            }, (errorResponse: HttpErrorResponse) => {
                reject(errorResponse);
            });
        });
    }

    private like(applicant: Applicant): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (this.alreadyBookmarked) {
                this.notificationAndInterests(applicant, true).then(() => {
                    resolve();
                });
            } else {
                this.likeService.likeDislike(this.item._id, true).then(() => {
                    this.notificationAndInterests(applicant, true).then(() => {
                        resolve();
                    });
                }, (error: HttpErrorResponse) => {
                    reject(error);
                });
            }
        });
    }

    private notificationAndInterests(applicant: Applicant, saveInterest: boolean): Promise<{}> {
        return new Promise((resolve) => {
            const promises = new Array();
            promises.push(this.sendNotification(applicant));

            if (saveInterest) {
                promises.push(this.saveInterests(this.itemUser));
            }

            forkJoin(promises).subscribe(
                (data: number[][]) => {
                    resolve();
                }
            );
        });
    }

    // Notification
    private sendNotification(applicant: Applicant): Promise<{}> {
        return new Promise((resolve) => {
            this.notificationService.send(this.user, this.item.user, this.item, this.item.appointment, applicant,
                this.RESOURCES.NOTIFICATION.TYPE.APPLICATION_NEW).then((notification: Notification) => {
                resolve();
            }, (response: HttpErrorResponse) => {
                // We ignore the notifications error
                resolve();
            });
        });
    }

    private buildAppointmentApplicant(): Promise<Applicant> {
        return new Promise<Applicant>((resolve) => {
            const applicant: Applicant = this.hasExistingApplicant() ? this.existingApplicant :
                new Applicant(this.item.appointment, this.user, this.item);

            applicant.status = this.RESOURCES.APPLICANT.STATUS.NEW;

            for (let i: number = 0; i < this.selectedAppointmentStartTimes.length; i++) {
                const agenda: ApplicantAgenda = new ApplicantAgenda();
                agenda.when = new Date(this.selectedAppointmentStartTimes[i]);
                agenda.status = this.RESOURCES.APPLICANT.AGENDA.STATUS.NEW;

                applicant.agenda.push(agenda);
            }

            resolve(applicant);
        });
    }

    private hasExistingApplicant(): boolean {
        return !Comparator.isEmpty(this.existingApplicant);
    }

    hasItemAppointment() {
        return !Comparator.isEmpty(this.item) && !Comparator.isEmpty(this.item.appointment);
    }

}
