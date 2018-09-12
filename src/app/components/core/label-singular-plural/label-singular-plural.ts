import {Component, Input} from '@angular/core';
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'label-singular-plural.html',
    selector: 'app-label-singular-plural'
})
export class LabelSingularPluralComponent {

    @Input() keySingular: String;
    @Input() keyPlural: String;

    @Input() value: number;

    isPlural() {
        return !Comparator.isNumberNullOrZero(this.value) && this.value > 1.0;
    }

    isSingular() {
        return this.value <= 1.0;
    }
}
