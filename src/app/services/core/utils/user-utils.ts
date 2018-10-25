// Model
import {User} from '../../model/user/user';

// Utils
import {Comparator} from './utils';
import {Resources} from './resources';

export class UsersComparator {

    static isValid(user: User): boolean {
        return !Comparator.isEmpty(user) &&
                !Comparator.equals(user.status, Resources.Constants.USER.STATUS.DELETED) &&
                !Comparator.equals(user.status, Resources.Constants.USER.STATUS.BLOCKED);
    }
}