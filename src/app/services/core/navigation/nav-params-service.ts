import {Injectable} from '@angular/core';

import {Card} from 'ionic-swing';

// Model
import {Item} from '../../model/item/item';
import {ItemUser} from '../../model/item/item-user';
import {Applicant} from '../../model/appointment/applicant';
import {User} from '../../model/user/user';

// Utils
import {Comparator} from '../utils/utils';

export interface Navigation {
    adDisplay?: boolean;
}

export interface ItemDetailsNavParams {
    item: Item;
    itemUser: ItemUser;
    itemSwingCard?: Card;
    bookmarked?: boolean;
    disliked?: boolean;
    applicant?: Applicant;
    deeplink?: boolean;
    callback?: Function;
    displayChat?: boolean;
    backUrl?: string;
}

export interface ChatNavParams extends Navigation {
    item: Item;
    itemUser?: ItemUser;
    applicant: Applicant;
    userStarred: boolean;
}

export interface NewAdNavParams {
    backToPageUrl: string;
}

export interface LoginNavParams {
    authorized: boolean;
}

export interface ApplicantSelectionNavParams {
    applicant: Applicant;
    applicantIndex?: number;
    updateApplicantCallback?: Function;
    item: Item;
    userStarred: boolean;
    subPage?: string;
}

export interface CandidateDetailsNavParams {
    item: Item;
    candidate: User;
    starred: boolean;
    starredCandidateCallCallback: Function;
}

export interface AdminAdsNavParams {
    backToPageUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class NavParamsService {

    private itemDetailsNavParams: ItemDetailsNavParams;
    private chatNavParams: ChatNavParams;
    private newAdNavParams: NewAdNavParams;
    private loginNavParams: LoginNavParams;
    private applicantSelectionNavParams: ApplicantSelectionNavParams;
    private candidateDetailsNavParams: CandidateDetailsNavParams;
    private adminAdsNavParams: AdminAdsNavParams;

    getItemDetailsNavParams(): Promise<ItemDetailsNavParams> {
        return new Promise<ItemDetailsNavParams>((resolve, reject) => {
            if (Comparator.isEmpty(this.itemDetailsNavParams)) {
                reject();
            } else {
                resolve(this.itemDetailsNavParams);
            }
        });
    }

    setItemDetailsNavParams(navParams: ItemDetailsNavParams) {
        this.itemDetailsNavParams = navParams;
    }

    getChatNavParams(): Promise<ChatNavParams> {
        return new Promise<ChatNavParams>((resolve, reject) => {
            if (Comparator.isEmpty(this.chatNavParams)) {
                reject();
            } else {
                resolve(this.chatNavParams);
            }
        });
    }

    setChatNavParams(navParams: ChatNavParams) {
        this.chatNavParams = navParams;
    }

    getNewAdNavParams(): Promise<NewAdNavParams> {
        return new Promise<NewAdNavParams>((resolve) => {
            resolve(this.newAdNavParams);
        });
    }

    setNewAdNavParams(navParams: NewAdNavParams) {
        this.newAdNavParams = navParams;
    }

    getLoginNavParams(): Promise<LoginNavParams> {
        return new Promise<LoginNavParams>((resolve) => {
            resolve(this.loginNavParams);
        });
    }

    setLoginNavParams(navParams: LoginNavParams) {
        this.loginNavParams = navParams;
    }

    getApplicantSelectionNavParams(): Promise<ApplicantSelectionNavParams> {
        return new Promise<ApplicantSelectionNavParams>((resolve, reject) => {
            if (Comparator.isEmpty(this.applicantSelectionNavParams)) {
                reject();
            } else {
                resolve(this.applicantSelectionNavParams);
            }
        });
    }

    setApplicantSelectionNavParams(navParams: ApplicantSelectionNavParams) {
        this.applicantSelectionNavParams = navParams;
    }

    getCandidateDetailsNavParams(): Promise<CandidateDetailsNavParams> {
        return new Promise<CandidateDetailsNavParams>((resolve, reject) => {
            if (Comparator.isEmpty(this.candidateDetailsNavParams)) {
                reject();
            } else {
                resolve(this.candidateDetailsNavParams);
            }
        });
    }

    setCandidateDetailsNavParams(navParams: CandidateDetailsNavParams) {
        this.candidateDetailsNavParams = navParams;
    }

    getAdminAdsNavParams(): Promise<AdminAdsNavParams> {
        return new Promise<AdminAdsNavParams>((resolve) => {
            resolve(this.adminAdsNavParams);
        });
    }

    setAdminAdsNavParams(navParams: AdminAdsNavParams) {
        this.adminAdsNavParams = navParams;
    }
}
