import {Component, HostListener, ViewChild} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {LoadingController, ModalController, NavParams, Platform, Slides} from '@ionic/angular';

// Modal
import {AbstractModal} from '../../core/abstract-modal';

// Model
import {User, UserInterest, UserInterests} from '../../../services/model/user/user';
import {Location} from '../../../services/model/location/location';
import {Address} from '../../../services/model/utils/address';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

// Services
import {UserSessionService} from '../../../services/core/user/user-session-service';
import {GoogleAnalyticsNativeService} from '../../../services/native/analytics/google-analytics-native-service';
import {UserInterestsService} from '../../../services/core/user/user-interetsts-service';

@Component({
    templateUrl: 'select-interest.html',
    styleUrls: ['./select-interest.scss'],
    selector: 'app-select-interest'
})
export class SelectInterestModal extends AbstractModal {

    @ViewChild('interestSlider') slider: Slides;

    user: User;

    interest: UserInterest;
    currentInterest: UserInterest;

    private index: number;

    travelTime: number;

    private doSave: boolean = true;

    firstSlide: boolean = true;
    displayFooterButtons: boolean = false;

    constructor(private platform: Platform,
                private navParams: NavParams,
                private modalController: ModalController,
                private loadingController: LoadingController,
                private userSessionService: UserSessionService,
                private googleAnalyticsNativeService: GoogleAnalyticsNativeService,
                private userInterestsService: UserInterestsService) {
        super();

        this.gaTrackEvent(this.platform, this.googleAnalyticsNativeService, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.CATEGORY.MODAL, this.RESOURCES.GOOGLE.ANALYTICS.TRACKER.EVENT.ACTION.PARAMS.SELECT_INTERESTS);
    }

    ionViewWillEnter() {
        this.user = this.navParams.get('user');

        this.interest = this.navParams.get('interest');
        this.index = this.navParams.get('index');

        this.doSave = this.navParams.get('save');

        if (Comparator.isEmpty(this.interest)) {
            this.currentInterest = null;
        } else {
            this.currentInterest = JSON.parse(JSON.stringify(this.interest));
        }

        this.initTravelTime();
    }

    private initTravelTime() {
        this.travelTime = Comparator.isEmpty(this.interest) || this.interest.maxTravelTime == null ? this.RESOURCES.USER.INTEREST.TRAVEL_TIME.MAX : this.interest.maxTravelTime;
    }

    private addUserInterest() {
        if (Comparator.isEmpty(this.user.userParams.interests)) {
            this.user.userParams.interests = new UserInterests();

            this.user.userParams.interests.interests = new Array<UserInterest>();
        }

        this.user.userParams.interests.interests.push(this.interest);
    }

    close() {
        this.modalController.dismiss().then(() => {
            // Do nothing
        });
    }

    selectInterest() {
        // If interest is new and completed or if modififed
        if (this.currentInterest == null || !Comparator.equals(this.currentInterest, this.interest)) {
            if (!Comparator.isEmpty(this.user.userParams.interests) && Comparator.hasElements(this.user.userParams.interests.interests) && this.user.userParams.interests.interests.length > this.index) {
                this.user.userParams.interests.interests[this.index].location = this.interest.location;
                this.user.userParams.interests.interests[this.index].addressName = this.interest.addressName;
                this.user.userParams.interests.interests[this.index].travelMode = this.interest.travelMode;
                this.user.userParams.interests.interests[this.index].maxTravelTime = this.interest.maxTravelTime;

                this.user.userParams.interests.interests[this.index].status = true;
                this.user.userParams.interests.interests[this.index].updatedAt = new Date();
            } else {
                this.addUserInterest();
            }

            this.initSave();
        }

        this.modalController.dismiss(this.interest).then(() => {
            // Do nothing
        });
    }

    changeLocation() {
        this.slider.slideNext();
    }

    selectLocation(selectedLocation: Address) {
        const location = new Location();
        location.lng = selectedLocation.location.lng;
        location.lat = selectedLocation.location.lat;

        this.interest.location = location;
        this.interest.addressName = selectedLocation.addressName;

        this.slider.slidePrev();
    }

    backToPreviousSlide() {
        this.slider.slidePrev();
    }

    isInterestAddressNotDefined(): boolean {
        return Comparator.isStringEmpty(this.interest.addressName);
    }

    isTravelModeTransit(): boolean {
        return this.isTravelMode(this.RESOURCES.USER.INTEREST.TRAVEL_MODE.TRANSIT);
    }

    isTravelModeDriving(): boolean {
        return this.isTravelMode(this.RESOURCES.USER.INTEREST.TRAVEL_MODE.DRIVING);
    }

    isTravelModeBicycling(): boolean {
        return this.isTravelMode(this.RESOURCES.USER.INTEREST.TRAVEL_MODE.BICYCLING);
    }

    isTravelModeWalking(): boolean {
        return this.isTravelMode(this.RESOURCES.USER.INTEREST.TRAVEL_MODE.WALKING);
    }

    private isTravelMode(mode: string): boolean {
        return Comparator.equals(this.interest.travelMode, mode);
    }

    selectTravelModeTransit() {
        this.selectTravelMode(this.RESOURCES.USER.INTEREST.TRAVEL_MODE.TRANSIT);
    }

    selectTravelModeDriving() {
        this.selectTravelMode(this.RESOURCES.USER.INTEREST.TRAVEL_MODE.DRIVING);
    }

    selectTravelModeBicycling() {
        this.selectTravelMode(this.RESOURCES.USER.INTEREST.TRAVEL_MODE.BICYCLING);
    }

    selectTravelModeWalking() {
        this.selectTravelMode(this.RESOURCES.USER.INTEREST.TRAVEL_MODE.WALKING);
    }

    private selectTravelMode(mode: string) {
        this.interest.travelMode = mode;
    }

    onTravelTimeChange(ev: Range) {
        if (this.RESOURCES.USER.INTEREST.TRAVEL_TIME.MAX === this.travelTime) {
            this.interest.maxTravelTime = null;
        } else {
            this.interest.maxTravelTime = this.travelTime;
        }
    }

    hasTravelTime(): boolean {
        return this.interest.maxTravelTime != null;
    }

    isTypeWork(): boolean {
        return this.isType(this.RESOURCES.USER.INTEREST.TYPE.WORK);
    }

    isTypeTrain(): boolean {
        return this.isType(this.RESOURCES.USER.INTEREST.TYPE.TRAIN);
    }

    isTypeSchool(): boolean {
        return this.isType(this.RESOURCES.USER.INTEREST.TYPE.SCHOOL);
    }

    isTypeAirport(): boolean {
        return this.isType(this.RESOURCES.USER.INTEREST.TYPE.AIRPORT);
    }

    isTypeLove(): boolean {
        return this.isType(this.RESOURCES.USER.INTEREST.TYPE.LOVE);
    }

    isTypeTraining(): boolean {
        return this.isType(this.RESOURCES.USER.INTEREST.TYPE.TRAINING);
    }

    private isType(type: string): boolean {
        return Comparator.equals(this.interest.type, type);
    }

    isConfirmAllowed(): boolean {
        return !Comparator.isStringEmpty(this.interest.addressName);
    }

    @HostListener('document:ionBackButton', ['$event'])
    private overrideHardwareBackAction($event: any) {
        $event.detail.register(100, async () => {
            const isFirstSlide: boolean = await this.slider.isBeginning();

            if (!isFirstSlide) {
                this.backToPreviousSlide();
            } else {
                this.close();
            }
        });
    }

    selectTypeWork() {
        this.initInterestAndSlideNext('work');
    }

    selectTypeTrain() {
        this.initInterestAndSlideNext('train');
    }

    selectTypeSchool() {
        this.initInterestAndSlideNext('school');
    }

    selectTypeAirport() {
        this.initInterestAndSlideNext('airport');
    }

    selectTypeLove() {
        this.initInterestAndSlideNext('love');
    }

    selectTypeTraining() {
        this.initInterestAndSlideNext('training');
    }

    private async initInterestAndSlideNext(type: string) {
        const loading: HTMLIonLoadingElement = await this.loadingController.create({});

        loading.present().then(() => {
            this.initUserDefaultInterest(type).then((interest: UserInterest) => {
                loading.dismiss().then(() => {
                    this.interest = interest;
                    this.initTravelTime();
                    this.slider.slideNext();
                });
            });
        });
    }

    private initUserDefaultInterest(type: string): Promise<{}> {
        return new Promise((resolve) => {
            if (type === this.RESOURCES.USER.INTEREST.TYPE.WORK) {
                this.userInterestsService.buildDefaultInterestWork(this.user).then((interest: UserInterest) => {
                    if (interest != null) {
                        interest.type = type;
                        resolve(interest);
                    } else {
                        resolve(this.emptyInterest(type));
                    }
                }, (err: HttpErrorResponse) => {
                    resolve(this.emptyInterest(type));
                });
            } else if (type === this.RESOURCES.USER.INTEREST.TYPE.TRAIN) {
                this.userInterestsService.buildDefaultInterestTrainStation(this.user).then((interest: UserInterest) => {
                    if (interest != null) {
                        interest.type = type;
                        resolve(interest);
                    } else {
                        resolve(this.emptyInterest(type));
                    }
                }, (err: HttpErrorResponse) => {
                    resolve(this.emptyInterest(type));
                });
            } else if (type === this.RESOURCES.USER.INTEREST.TYPE.SCHOOL) {
                this.userInterestsService.buildDefaultInterestEducation(this.user).then((interest: UserInterest) => {
                    if (interest != null) {
                        interest.type = type;
                        resolve(interest);
                    } else {
                        resolve(this.emptyInterest(type));
                    }
                }, (err: HttpErrorResponse) => {
                    resolve(this.emptyInterest(type));
                });
            } else if (type === this.RESOURCES.USER.INTEREST.TYPE.AIRPORT) {
                this.userInterestsService.buildDefaultInterestAirpot(this.user).then((interest: UserInterest) => {
                    if (interest != null) {
                        interest.type = type;
                        resolve(interest);
                    } else {
                        resolve(this.emptyInterest(type));
                    }
                }, (err: HttpErrorResponse) => {
                    resolve(this.emptyInterest(type));
                });
            } else {
                resolve(this.emptyInterest(type));
            }
        });
    }

    private emptyInterest(type: string): UserInterest {
        const interest: UserInterest = new UserInterest();
        interest.type = type;
        return interest;
    }

    deleteInterest() {
        if (this.currentInterest != null) {
            if (!Comparator.isEmpty(this.user.userParams.interests) && Comparator.hasElements(this.user.userParams.interests.interests) && this.user.userParams.interests.interests.length > this.index) {
                this.interest.status = false;
                this.user.userParams.interests.interests.splice(this.index, 1);

                this.initSave();
            }
        }

        this.modalController.dismiss(this.interest).then(() => {
            // Do nothing
        });
    }

    private initSave() {
        if (this.doSave) {
            // Will allow us to detect the modification to update the user
            this.userSessionService.setUserToSave(this.user);
        }
    }

    async sliderFirstSlide() {
        if (!this.slider) {
            return;
        }

        this.firstSlide = await this.slider.isBeginning();

        const activeIndex: number = await this.slider.getActiveIndex();
        this.displayFooterButtons = (activeIndex === (this.currentInterest == null ? 1 : 0));
    }

}
