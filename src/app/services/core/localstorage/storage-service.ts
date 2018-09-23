import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';

// Model
import {AccessToken} from '../../model/user/user';
import {NewItemRecovery} from '../../model/utils/new-item-recovery';
import {PwaLoginState} from '../../model/utils/pwa-login-state';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(private storage: Storage) {
    }

    saveAccessToken(token: AccessToken): Promise<AccessToken> {
        return this.storage.set('fluster_token', token);
    }

    retrieveAccessToken(): Promise<AccessToken> {
        return this.storage.get('fluster_token');
    }

    clear(): Promise<void> {
        return this.storage.clear();
    }

    saveWarningAdsExpiredWasSeenOnce(seen: boolean): Promise<boolean> {
        return this.storage.set('fluster_ads_expire_was_seen', seen);
    }

    retrieveWarningAdsExpiredWasSeenOnce(): Promise<boolean> {
        return this.storage.get('fluster_ads_expire_was_seen');
    }

    saveDislikeInfoSeenOnce(seen: boolean): Promise<boolean> {
        return this.storage.set('fluster_dislike_info_seen', seen);
    }

    retrieveDislikeInfoWasSeenOnce(): Promise<boolean> {
        return this.storage.get('fluster_dislike_info_seen');
    }

    saveLikeInfoSeenOnce(seen: boolean): Promise<boolean> {
        return this.storage.set('fluster_like_info_seen', seen);
    }

    retrieveLikeInfoWasSeenOnce(): Promise<boolean> {
        return this.storage.get('fluster_like_info_seen');
    }

    saveRescheduleInfoSeenOnce(seen: boolean): Promise<boolean> {
        return this.storage.set('fluster_reschedule_info_seen', seen);
    }

    retrieveRescheduleInfoWasSeenOnce(): Promise<boolean> {
        return this.storage.get('fluster_reschedule_info_seen');
    }

    saveRoomatesWereSeenOnce(firstTime: boolean): Promise<boolean> {
        return this.storage.set('fluster_roomates_were_seen', firstTime);
    }

    retrieveRoomatesWereSeenOnce(): Promise<boolean> {
        return this.storage.get('fluster_roomates_were_seen');
    }

    saveSuperstarWasSeenOnce(firstTime: boolean): Promise<boolean> {
        return this.storage.set('fluster_superstar_was_seen', firstTime);
    }

    retrieveSuperstarWasSeenOnce(): Promise<boolean> {
        return this.storage.get('fluster_superstar_was_seen');
    }

    saveNewItemRecovery(newItemRecovery: NewItemRecovery): Promise<NewItemRecovery> {
        return this.storage.set('fluster_new_item_recovery', newItemRecovery);
    }

    getNewItemRecovery(): Promise<NewItemRecovery> {
        return this.storage.get('fluster_new_item_recovery');
    }

    removeNewItemRecovery(): Promise<NewItemRecovery> {
        return this.storage.remove('fluster_new_item_recovery');
    }

    saveProfileCompletedOnce(completed: boolean): Promise<boolean> {
        return this.storage.set('fluster_profile_completed_once', completed);
    }

    retrieveProfileWasCompletedOnce(): Promise<boolean> {
        return this.storage.get('fluster_profile_completed_once');
    }

    saveItemsNavInfoSeenOnce(seen: boolean): Promise<boolean> {
        return this.storage.set('fluster_items_nav_info_seen', seen);
    }

    retrieveItemsNavInfoWasSeenOnce(): Promise<boolean> {
        return this.storage.get('fluster_items_nav_info_seen');
    }

    saveLoginState(state: PwaLoginState): Promise<PwaLoginState> {
        return this.storage.set('fluster_login_state', state);
    }

    retrieveLoginState(): Promise<PwaLoginState> {
        return this.storage.get('fluster_login_state');
    }

    savePrefillItemAppointmentsStartTimes(selectedAppointmentsStartTimes: number[]): Promise<number[]> {
        return this.storage.set('fluster_prefill_item_appointments', selectedAppointmentsStartTimes);
    }

    retrievePrefillItemAppointmentsStartTimes(): Promise<number[]> {
        return this.storage.get('fluster_prefill_item_appointments');
    }

}
