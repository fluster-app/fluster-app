import {Component, Input} from '@angular/core';

@Component({
    templateUrl: 'display-floor.html',
    selector: 'app-display-floor'
})
export class DisplayFloorComponent {

    @Input() floor: number;

    @Input() displayText: boolean = true;

    constructor() {

    }

}
