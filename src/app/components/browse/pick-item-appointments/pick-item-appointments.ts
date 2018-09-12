import {Component, Input, Output, EventEmitter, OnChanges, SimpleChange} from '@angular/core';
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

// Utils
import {Comparator, Converter} from '../../../services/core/utils/utils';

// Services
import {AppointmentService} from '../../../services/core/appointment/appointment-service';
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {NotificationService} from '../../../services/core/notification/notification-service';
import {ItemUsersService} from '../../../services/browse/item-users-service';
import {LikeService} from '../../../services/browse/like-service';
import {SubscriptionService} from '../../../services/core/user/subscription-service';

@Component({
    templateUrl: 'pick-item-appointments.html',
    selector: 'app-pick-item-appointments'
})
export class PickItemAppointmentsComponent extends AbstractItemsPage implements OnChanges {

    @Output() notifiyScheduled: EventEmitter<{}> = new EventEmitter<{}>();

    @Input() item: Item;
    @Input() itemUser: ItemUser;
    @Input() existingApplicant: Applicant;
    @Input() alreadyBookmarked: boolean;

    user: User;

    favoritesDates: number[];
    unavailableAppointmentDates: number[];
    rejectedAppointmentDates: number[];

    selectedAppointmentStartTimes: number[];

    private initializedOnce: boolean = false;

    constructor(private toastController: ToastController,
                protected popoverController: PopoverController,
                private loadingController: LoadingController,
                private translateService: TranslateService,
                protected itemUsersService: ItemUsersService,
                private notificationService: NotificationService,
                private likeService: LikeService,
                private appointmentService: AppointmentService,
                private userSessionService: UserSessionService,
                private subscriptionService: SubscriptionService) {

        super(popoverController, itemUsersService);

        this.user = this.userSessionService.getUser();
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (Comparator.isEmpty(this.item) || this.initializedOnce) {
            return;
        }

        this.initScheduledDates();
    }

    private initScheduledDates() {
        this.initializedOnce = true;

        const promises = new Array();
        promises.push(this.appointmentService.buildScheduledDates(this.item.appointment));
        promises.push(this.appointmentService.getAlreadyScheduledAppointmentsWithAttendance(this.item._id,
            this.item.appointment._id, this.item.appointment.attendance));
        promises.push(this.buildUnavailableAppointments());
        promises.push(this.appointmentService.getMyApplicants(null));

        forkJoin(promises).subscribe(
            (data: number[][]) => {

                // Advertiser scheduled dates and user overall already scheduled dates
                let allAlreadyScheduledDates: number[] = data[1];
                allAlreadyScheduledDates = allAlreadyScheduledDates.concat(data[3]);

                let allUnavailableDates: number[] = allAlreadyScheduledDates;
                allUnavailableDates = allUnavailableDates.concat(data[2]);

                this.hasStillAvailableDates(data[0], allUnavailableDates).then((hasStillAvailableDates: boolean) => {
                    this.favoritesDates = hasStillAvailableDates ? data[0] : new Array();
                    this.unavailableAppointmentDates = allAlreadyScheduledDates;
                    this.rejectedAppointmentDates = data[2];
                });
            }
        );
    }

    private buildUnavailableAppointments(): Promise<{}> {
        return new Promise((resolve) => {
            const result: number[] = new Array();

            // If there is already an applicant, the dates which were already used can't be used again
            if (this.hasExistingApplicant() && Comparator.hasElements(this.existingApplicant.agenda)) {
                for (let i: number = 0; i < this.existingApplicant.agenda.length; i++) {
                    result.push(Converter.getDateObj(this.existingApplicant.agenda[i].when).getTime());
                }
            }

            resolve(result);
        });
    }


    private hasStillAvailableDates(availableDates: number[], unavailableDates: number[]): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.hasElements(availableDates)) {
                resolve(true);
            } else if (!Comparator.hasElements(unavailableDates)) {
                resolve(true);
            } else {
                const result: boolean = this.compareStillAvailableDates(availableDates, unavailableDates);

                resolve(result);
            }
        });
    }

    private compareStillAvailableDates(availableDates: number[], unavailableDates: number[]): boolean {
        for (let i: number = 0; i < availableDates.length; i++) {
            if (unavailableDates.indexOf(availableDates[i]) === -1) {
                return true;
            }
        }

        return false;
    }

    schedule(selectedAppointmentStartTimes: number[]) {
        this.selectedAppointmentStartTimes = selectedAppointmentStartTimes;

        this.subscriptionService.couldAddLike().then((result: boolean) => {
            if (result) {
                this.initAndDoSchedule();
            } else {
                this.showProductModal(this.doProductCallback);
            }
        });
    }

    private doProductCallback = () => {
        this.initAndDoSchedule();
    }

    private async initAndDoSchedule() {
        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            this.doSchedule().then(() => {
                this.notifiyScheduled.emit();
                loading.dismiss();
            }, (error: HttpErrorResponse) => {
                loading.dismiss();
                this.errorMsg(this.toastController, this.translateService, 'ERRORS.ITEMS.ACTION_ERROR');
            });
        });
    }

    private doSchedule(): Promise<{}> {
        return new Promise((resolve, reject) => {
            const promise = this.hasExistingApplicant() ? this.updateWithNewSchedule() : this.createNewSchedule();

            promise.then(() => {
                resolve();
            }, (errorResponse: HttpErrorResponse) => {
                reject(errorResponse);
            });
        });
    }

    private updateWithNewSchedule(): Promise<{}> {
        return new Promise((resolve, reject) => {
            const applicant: Applicant = this.buildAppointmentApplicant();

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
        return new Promise((resolve, reject) => {
            const applicant: Applicant = this.buildAppointmentApplicant();

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

    private buildAppointmentApplicant(): Applicant {
        const applicant: Applicant = this.hasExistingApplicant() ? this.existingApplicant :
            new Applicant(this.item.appointment, this.user, this.item);

        applicant.status = this.RESOURCES.APPLICANT.STATUS.NEW;

        for (let i: number = 0; i < this.selectedAppointmentStartTimes.length; i++) {
            const agenda: ApplicantAgenda = new ApplicantAgenda();
            agenda.when = new Date(this.selectedAppointmentStartTimes[i]);
            agenda.status = this.RESOURCES.APPLICANT.AGENDA.STATUS.NEW;

            applicant.agenda.push(agenda);
        }

        return applicant;
    }

    private hasExistingApplicant(): boolean {
        return !Comparator.isEmpty(this.existingApplicant);
    }

    hasItemAppointment() {
        return !Comparator.isEmpty(this.item) && !Comparator.isEmpty(this.item.appointment);
    }

}
