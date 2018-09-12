import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

@Component({
    templateUrl: 'web-social-share.html',
    styleUrls: ['./web-social-share.scss'],
    selector: 'app-web-social-share',
    encapsulation: ViewEncapsulation.None
})
export class WebSocialShareComponent {

    @Input() show: boolean = false;
    @Input() share: any;

    @Output() closed: EventEmitter<boolean> = new EventEmitter<boolean>();

    sharePWAClose() {
        this.closed.emit(true);
    }

}
