import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Platform} from '@ionic/angular';

@Component({
    selector: 'app-big-button',
    templateUrl: './big-button.component.html',
    styleUrls: ['./big-button.component.scss']
})
export class BigButtonComponent {

    @Output() clicked: EventEmitter<any> = new EventEmitter<any>();

    // Per default big button
    @Input() bigButton: boolean = true;
    @Input() mediumButton: boolean = false;

    @Input() bigButtonItem: boolean = false;
    @Input() bigButtonAds: boolean = false;
    @Input() bigButtonEnabled: boolean = false;
    @Input() bigButtonDisabled: boolean = false;
    @Input() bigButtonActivated: boolean = false;

    @Input() mediumButtonAds: boolean = false;
    @Input() mediumButtonItem: boolean = false;
    @Input() mediumButtonSuperstar: boolean = false;

    @Input() smallButton: boolean = false;
    @Input() smallButtonAds: boolean = false;
    @Input() smallButtonCancel: boolean = false;

    @Input() icon: string;
    @Input() iconIos: string;
    @Input() iconMd: string;
    @Input() iconSrc: string;

    @Input() label: string;
    @Input() labelVariable: string;

    @Input() adDisplay: boolean = false;

    constructor(private platform: Platform) {
    }

    forwardClickEvent($event: any) {
        this.clicked.emit($event);
    }

    isAndroid(): boolean {
        return this.platform.is('android');
    }

}
