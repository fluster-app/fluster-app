import {Component, ElementRef, Input, ViewChild} from '@angular/core';

// Model
import {User} from '../../../services/model/user/user';

// Utils
import {Comparator} from '../../../services/core/utils/utils';
import {Content} from '@ionic/angular';

@Component({
    templateUrl: 'user-profile-input-bio.html',
    styleUrls: ['./user-profile-input-bio.scss'],
    selector: 'app-user-profile-input-bio'
})
export class UserProfileInputBioComponent {

    @ViewChild('userbio', {read: ElementRef}) userBio: ElementRef;

    @Input() user: User;

    @Input() content: Content;

    private bioMaxLength: number = 500;
    bioLengthLeft: number = 500;

    private extraScroll: number = 80;

    addKeyboardListener() {
        window.addEventListener('keyboardDidShow', this.addContentPadding);
        window.addEventListener('keyboardDidHide', this.removeContentPadding);
    }

    removeKeyboardListener() {
        window.removeEventListener('keyboardDidHide', this.removeContentPadding);
        window.removeEventListener('keyboardDidShow', this.addContentPadding);
    }

    private addContentPadding = (event: any) => {
        if (this.content && this.userBio) {
            this.content.scrollToPoint(0, this.userBio.nativeElement.offsetParent.offsetTop - this.extraScroll);
        }
    }

    private removeContentPadding = () => {
        // TODO: Replace with clearScrollPaddingFocusOut once implemented in https://github.com/ionic-team/ionic/issues/14793
        if (this.content && this.userBio) {
            this.content.scrollToPoint(0, this.userBio.nativeElement.offsetParent.offsetTop + this.extraScroll);
        }
    }

    countCharactersLeft() {
        this.bioLengthLeft = this.bioMaxLength - (Comparator.isStringEmpty(this.user.description.bio) ? 0 :
            this.user.description.bio.length);
    }

}
