import {Pipe, PipeTransform} from '@angular/core';

// Model
import {Applicant} from '../../../services/model/appointment/applicant';

// Resources and utils
import {Resources} from '../../../services/core/utils/resources';
import {Converter} from '../../../services/core/utils/utils';

@Pipe({name: 'orderByApplicantStatus'})
export class ApplicantsSortPipe implements PipeTransform {

    transform(input: Applicant[], subscriptionIds: string[]): any {
        if (input == null || input.length === 0) {
            return input;
        }

        // So we don't have to check for null each times later in the sort
        if (subscriptionIds == null) {
            subscriptionIds = new Array();
        }

        const sortedApplicants: Applicant[] = this.sortApplicantsByStatus(input, subscriptionIds);

        return sortedApplicants;
    }

    private sortApplicantsByStatus(input: Applicant[], subscriptionIds: string[]): Applicant[] {
        return input.sort((a: Applicant, b: Applicant) => {

            if (a.status === Resources.Constants.APPLICANT.STATUS.NEW && b.status === Resources.Constants.APPLICANT.STATUS.NEW) {
                if (subscriptionIds.indexOf(a.user._id) > -1) {
                    if (subscriptionIds.indexOf(b.user._id) > -1) {
                        return this.compareApplicantStatus(a, b);
                    } else {
                        return -1;
                    }
                } else if (subscriptionIds.indexOf(b.user._id) > -1) {
                    return 1;
                } else {
                    return this.compareApplicantStatus(a, b);
                }
            } else {
                return this.compareApplicantStatus(a, b);
            }
        });
    }

    private compareApplicantStatus(a: Applicant, b: Applicant): number {

        if (a.status === Resources.Constants.APPLICANT.STATUS.NEW) {
            if (b.status === Resources.Constants.APPLICANT.STATUS.NEW) {
                // The most recent first
                return Converter.getDateObj(b.createdAt).getTime() - Converter.getDateObj(a.createdAt).getTime();
            } else {
                return -1;
            }
        } else if (a.status === Resources.Constants.APPLICANT.STATUS.ACCEPTED) {
            if (b.status === Resources.Constants.APPLICANT.STATUS.NEW) {
                return 1;
            } else if (b.status === Resources.Constants.APPLICANT.STATUS.ACCEPTED) {
                return Converter.getDateObj(b.createdAt).getTime() - Converter.getDateObj(a.createdAt).getTime();
            } else if (b.status === Resources.Constants.APPLICANT.STATUS.CANCELLED) {
                return -1;
            } else {
                return 1;
            }
        } else if (a.status === Resources.Constants.APPLICANT.STATUS.CANCELLED) {
            if (b.status === Resources.Constants.APPLICANT.STATUS.CANCELLED) {
                return Converter.getDateObj(b.createdAt).getTime() - Converter.getDateObj(a.createdAt).getTime();
            } else {
                return 1;
            }
        } else if (a.status === Resources.Constants.APPLICANT.STATUS.TO_RESCHEDULE) {
            if (b.status === Resources.Constants.APPLICANT.STATUS.ACCEPTED) {
                return -1;
            } else if (b.status === Resources.Constants.APPLICANT.STATUS.TO_RESCHEDULE) {
                return Converter.getDateObj(b.createdAt).getTime() - Converter.getDateObj(a.createdAt).getTime();
            } else if (b.status === Resources.Constants.APPLICANT.STATUS.CANCELLED) {
                return -1;
            } else {
                return 1;
            }
        } else {
            return 1;
        }
    }

}
