import {Component, Input, AfterViewInit, Output, EventEmitter, OnInit} from '@angular/core';
import {AlertController} from '@ionic/angular';

import {TranslateService} from '@ngx-translate/core';

// Model
import {User} from '../../../../services/model/user/user';

// Utils
import {Comparator} from '../../../../services/core/utils/utils';

@Component({
    templateUrl: 'item-details-toolbar.html',
    selector: 'app-item-details-toolbar'
})
export class ItemDetailsToolbarComponent implements OnInit, AfterViewInit {

    @Output() selectedCategory: EventEmitter<string> = new EventEmitter<string>();
    @Output() performAction: EventEmitter<string> = new EventEmitter<string>();

    // User to chat with
    @Input() user: User;

    @Input() isAdDisplay: boolean = false;
    @Input() isApplicantSelection: boolean = false;

    @Input() noAction: boolean = false;

    @Input() firstCategory: string;
    category: string;
    previousCategory: string;

    @Input() displayChat: boolean = true;

    @Input() itemShare: boolean = true;

    constructor(private alertController: AlertController,
                private translateService: TranslateService) {
    }

    ngOnInit() {
        this.category = this.firstCategory;
    }

    ngAfterViewInit() {
        this.previousCategory = this.category;
    }

    markPreviousCategory() {
        this.previousCategory = this.category;
    }

    private async alertChatNotAvailableYet() {
        const header: string = this.translateService.instant('ITEM_DETAILS.CHAT_NOT_AVAILABLE.TITLE');
        const subHeader: string = this.translateService.instant('ITEM_DETAILS.CHAT_NOT_AVAILABLE.SUBTITLE',
            {who: Comparator.isEmpty(this.user) || Comparator.isEmpty(this.user.facebook) ? '' : this.user.facebook.firstName});

        const notAvailable: string = this.translateService.instant('ITEM_DETAILS.CHAT_NOT_AVAILABLE.TEXT');
        const yes: string = this.translateService.instant('CORE.YES');
        const cancel: string = this.translateService.instant('CORE.CANCEL');
        const accept: string = this.translateService.instant('APPLICANT_SELECTION.ACTION_SHEET.ACCEPT');
        const ok: string = this.translateService.instant('CORE.OK');
        const textAdDisplay: string = this.translateService.instant('ITEM_DETAILS.CHAT_NOT_AVAILABLE.TEXT_AD_DISPLAY');

        const buttons = new Array();

        buttons.push({
            text: this.noAction ? ok : cancel,
            handler: () => {
                this.setPreviousCategory();
            }
        });

        if (!this.noAction) {
            buttons.push({
                text: yes,
                handler: () => {
                    this.emitPerformAction();
                }
            });
        }

        const confirm: HTMLIonAlertElement = await this.alertController.create({
            header: this.isAdDisplay ? null : header,
            subHeader: this.isAdDisplay ? null : subHeader,
            message: this.isAdDisplay ? textAdDisplay : (this.noAction ? null : (this.isApplicantSelection ? accept : notAvailable)),
            buttons: buttons
        });

        await confirm.present();
    }

    private emitPerformAction() {
        this.category = this.previousCategory;
        this.performAction.emit(this.category);
    }

    private setPreviousCategory() {
        this.category = this.previousCategory;
    }

    private emitCategory() {
        this.selectedCategory.emit(this.category);
    }

    segmentChange() {
        if (!Comparator.equals(this.category, 'chat')) {
            this.previousCategory = this.category;
            this.emitCategory();
        } else {
            this.alertChatNotAvailableYet();
        }
    }
}
