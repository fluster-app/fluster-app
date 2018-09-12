import {Component, Input, AfterViewInit} from '@angular/core';

// Utils
import {Comparator} from '../../../services/core/utils/utils';

@Component({
    templateUrl: 'display-appointments-count.html',
    styleUrls: ['./display-appointments-count.scss'],
    selector: 'app-display-appointments-count'
})
export class DisplayAppointmentsCountComponent implements AfterViewInit {

    @Input() selectedAppointments: number[];

    constructor() {

    }

    ngAfterViewInit(): void {

    }

    hasAppointments(): boolean {
        return Comparator.hasElements(this.selectedAppointments);
    }

    getSelectedAppointmentsCount(): number {
        return this.hasAppointments() ? this.selectedAppointments.length : 0;
    }

}
