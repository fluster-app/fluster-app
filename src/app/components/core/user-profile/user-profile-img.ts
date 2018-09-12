import {Platform} from '@ionic/angular';
import {Component, ElementRef, Input, QueryList, ViewChildren} from '@angular/core';

// Model
import {UserFacebook, UserGoogle} from '../../../services/model/user/user';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'user-profile-img.html',
    styleUrls: ['./user-profile-img.scss'],
    selector: 'app-user-profile-img'
})
export class UserProfileImgComponent {

    @ViewChildren('profileImg') imgs: QueryList<ElementRef>;

    @Input() facebook: UserFacebook;

    @Input() google: UserGoogle;

    @Input() small: boolean = true;

    constructor(private platform: Platform) {

    }

    hasFacebookId(): boolean {
        return !Comparator.isEmpty(this.facebook) && !Comparator.isStringEmpty(this.facebook.id);
    }

    hasGooglePicture(): boolean {
        return !Comparator.isEmpty(this.google) && !Comparator.isStringEmpty(this.google.id) && this.hasFacebookPicture();
    }

    private hasFacebookPicture(): boolean {
        return !Comparator.isEmpty(this.facebook) && !Comparator.isStringEmpty(this.facebook.pictureUrl);
    }

    isLargeScreen(): boolean {
        return this.platform.is('desktop') || this.platform.is('phablet') || this.platform.is('tablet');
    }

    imageNotFound() {
        this.useProfileCloseImage().then(() => {
            // Do nothing
        });
    }

    private useProfileCloseImage(): Promise<{}> {
        return new Promise((resolve) => {
            if (!Comparator.isEmpty(this.imgs) && this.imgs.length > 0) {
                this.imgs.forEach((img: ElementRef) => {
                    img.nativeElement.src = 'assets/img/profile_close.jpg';
                });
            }

            resolve();
        });
    }

    preventDrag($event) {
        $event.preventDefault();
    }
}
