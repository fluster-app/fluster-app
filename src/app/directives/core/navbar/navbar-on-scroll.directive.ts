import {Directive, ElementRef, HostListener, Input, Renderer2} from '@angular/core';
import {DomController, Platform} from '@ionic/angular';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

@Directive({
    selector: '[appNavbarOnScroll]'
})
export class NavbarOnScrollDirective {

    @Input() toolbar: ElementRef;

    private hidden: boolean = false;
    private triggerDistance: number = 20;

    private toolbarHeight: number;

    private stylesInitialized: boolean = false;

    constructor(private platform: Platform,
                private renderer: Renderer2,
                private domCtrl: DomController) {
    }

    @HostListener('ionScroll', ['$event'])
    hideNavbarOnScroll($event: any) {
        if (this.platform.is('ios')) {
            this.hideNavbarOnScrollIOS($event);
        } else {
            this.hideNavbarOnScrollAndroid($event);
        }
    }

    private hideNavbarOnScrollIOS($event: any) {
        if ($event != null && this.toolbar != null && this.toolbar.nativeElement != null &&
            !Comparator.isNumberNullOrZero(this.toolbar.nativeElement.clientHeight)) {

            const scrollTop: number = $event.detail.scrollTop;

            let translateHeader: number;

            if (scrollTop >= 0) {
                translateHeader = -1 * (scrollTop / 2);
            } else {
                translateHeader = 0;
            }

            if (translateHeader > 0) {
                translateHeader = 0;
            }

            this.domCtrl.write(() => {
                this.renderer.setStyle(this.toolbar.nativeElement, 'webkitTransform', 'translate3d(0,' + translateHeader + 'px,0)');
            });
        }
    }

    private hideNavbarOnScrollAndroid($event: any) {
        if ($event != null && this.toolbar != null && this.toolbar.nativeElement != null) {
            this.initStyles().then(() => {
                const delta: number = $event.detail.deltaY;

                if ($event.detail.currentY === 0 && this.hidden) {
                    this.show();
                } else if (!this.hidden && delta > this.triggerDistance) {
                    this.hide();
                } else if (this.hidden && delta < -this.triggerDistance) {
                    this.show();
                }
            });
        }
    }

    private initStyles(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.stylesInitialized) {
                resolve();
            } else {
                this.domCtrl.write(() => {
                    this.renderer.setStyle(this.toolbar.nativeElement, 'transition', '0.2s linear');

                    // We have to set the height to the element otherwise the very first scroll effect will not be smooth
                    this.toolbarHeight = this.toolbar.nativeElement.offsetHeight;
                    this.renderer.setStyle(this.toolbar.nativeElement, 'height', '' + this.toolbarHeight + 'px');

                    this.stylesInitialized = true;
                    resolve();
                });
            }
        });
    }

    private hide() {
        this.domCtrl.write(() => {
            this.renderer.setStyle(this.toolbar.nativeElement, 'min-height', '0px');
            this.renderer.setStyle(this.toolbar.nativeElement, 'height', '0px');
            this.renderer.setStyle(this.toolbar.nativeElement, 'padding', '0');
        });

        this.hidden = true;

    }

    private show() {

        this.domCtrl.write(() => {
            this.renderer.setStyle(this.toolbar.nativeElement, 'height', '' + this.toolbarHeight + 'px');
            this.renderer.removeStyle(this.toolbar.nativeElement, 'min-height');
            this.renderer.removeStyle(this.toolbar.nativeElement, 'padding');
        });

        this.hidden = false;

    }

}
