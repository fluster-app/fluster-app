import {Component, Input} from '@angular/core';

@Component({
    templateUrl: 'image-loader.html',
    styleUrls: ['./image-loader.scss'],
    selector: 'app-image-loader'
})
export class ImageLoaderComponent {
    @Input() src;

    loaded: boolean = false;

    imageLoaded() {
        this.loaded = true;
    }

    preventDrag($event) {
        $event.preventDefault();
    }
}
