import {Directive, ElementRef, HostListener, Input} from '@angular/core';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

@Directive({
    selector: '[appNavbarOnScroll]'
})
export class NavbarOnScrollDirective {

    @Input() header: ElementRef;

    // On Android only, when the ion-content length change, like in a detail page when a user change the categore, scroll events are triggered
    // which would cause a fast draw/redraw (quirk) of the header even if the scroll position doesn't change
    private scrollTop: number;

    constructor() {
    }

    @HostListener('ionScroll', ['$event'])
    hideNavbarOnScroll($event: any) {

        if ($event != null && this.header != null && this.header.nativeElement != null &&
            !Comparator.isNumberNullOrZero(this.header.nativeElement.clientHeight) &&
            $event.detail.scrollTop !== this.scrollTop) {

            this.scrollTop = $event.detail.scrollTop;

            let translateHeader: number;

            if (this.scrollTop >= 0) {
                translateHeader = -1 * (this.scrollTop / 2);
            } else {
                translateHeader = 0;
            }

            if (translateHeader > 0) {
                translateHeader = 0;
            }

            this.header.nativeElement.style.webkitTransform = 'translate3d(0,' + translateHeader + 'px,0)';
        }
    }

}
