import {Pipe, PipeTransform} from '@angular/core';

// Resources and utils
import {Converter, Comparator} from '../../../services/core/utils/utils';
import {Resources} from '../../../services/core/utils/resources';
import {ItemCard} from '../../../pages/browse/my-items/abstract-my-items';

@Pipe({name: 'orderItemsByApplicantStatus'})
export class MyItemsSortPipe implements PipeTransform {

    transform(input: ItemCard[]): any {
        if (input === null || input.length === 0) {
            return input;
        }

        const sortedItems: ItemCard[] = input.sort((a: ItemCard, b: ItemCard) => {

            if (Comparator.isEmpty(a.item.appointment.applicant)) {
                return -1;
            }

            if (Comparator.isEmpty(b.item.appointment.applicant)) {
                return 1;
            }

            if (a.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.NEW) {
                if (b.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.NEW) {
                    // The most recent first
                    return Converter.getDateObj(b.item.appointment.applicant[0].updatedAt).getTime() -
                        Converter.getDateObj(a.item.appointment.applicant[0].updatedAt).getTime();
                } else {
                    return -1;
                }
            } else if (a.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.ACCEPTED) {
                if (b.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.NEW) {
                    return 1;
                } else if (b.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.ACCEPTED) {
                    return Converter.getDateObj(a.item.appointment.applicant[0].selected).getTime() -
                        Converter.getDateObj(b.item.appointment.applicant[0].selected).getTime();
                } else if (b.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.CANCELLED) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (a.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.CANCELLED) {
                if (b.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.CANCELLED) {
                    return Converter.getDateObj(b.item.appointment.applicant[0].updatedAt).getTime() -
                        Converter.getDateObj(a.item.appointment.applicant[0].updatedAt).getTime();
                } else {
                    return 1;
                }
            } else if (a.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.TO_RESCHEDULE) {
                if (b.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.ACCEPTED) {
                    return -1;
                } else if (b.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.TO_RESCHEDULE) {
                    return Converter.getDateObj(b.item.appointment.applicant[0].updatedAt).getTime() -
                        Converter.getDateObj(a.item.appointment.applicant[0].updatedAt).getTime();
                } else if (b.item.appointment.applicant[0].status === Resources.Constants.APPLICANT.STATUS.CANCELLED) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                return 1;
            }


        });

        return sortedItems;
    }
}
