// Model
import {Applicant} from '../../model/appointment/applicant';

// Utils
import {Comparator} from './utils';
import {Resources} from './resources';

export class ApplicantsComparator {

    static couldChat(applicant: Applicant): boolean {
        return !Comparator.isEmpty(applicant) && (
            Comparator.equals(Resources.Constants.APPLICANT.STATUS.TO_RESCHEDULE, applicant.status) ||
            Comparator.equals(Resources.Constants.APPLICANT.STATUS.ACCEPTED, applicant.status) ||
            Comparator.equals(Resources.Constants.APPLICANT.STATUS.SELECTED, applicant.status) ||
            Comparator.equals(Resources.Constants.APPLICANT.STATUS.REJECTED, applicant.status));
    }

    static isAccepted(applicant: Applicant): boolean {
        return !Comparator.isEmpty(applicant) && (
            Comparator.equals(Resources.Constants.APPLICANT.STATUS.ACCEPTED, applicant.status) ||
            Comparator.equals(Resources.Constants.APPLICANT.STATUS.SELECTED, applicant.status) ||
            Comparator.equals(Resources.Constants.APPLICANT.STATUS.REJECTED, applicant.status));
    }
}
