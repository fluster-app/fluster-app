import * as moment from 'moment';

// Model
import {Item} from '../../model/item/item';

// Utils
import {Comparator, Converter} from './utils';
import {Resources} from './resources';

export class ItemsComparator {

    static isItemShare(item: Item): boolean {
        return !Comparator.isEmpty(item) && Comparator.equals(Resources.Constants.ITEM.TYPE.SHARE, item.attributes.type);
    }

    static isItemFlat(item: Item): boolean {
        return !Comparator.isEmpty(item) && (Comparator.equals(Resources.Constants.ITEM.TYPE.TAKEOVER, item.attributes.type) ||
            Comparator.equals(Resources.Constants.ITEM.TYPE.RENT, item.attributes.type));
    }

    static isItemStarred(item: Item): boolean {
        // Populated itemStars contains _id
        return !Comparator.isEmpty(item.itemStars) && !Comparator.isStringEmpty(item.itemStars._id);
    }

    static isItemExpiringSoon(item: Item): boolean {
        if (Comparator.isEmpty(item)) {
            return false;
        }

        let today: Date = new Date();
        today = moment(today).startOf('day').toDate();

        const dateCouldBeExtended: Date = moment(today).add(Resources.Constants.ITEM.END.DAYS_BEFORE_WARN, 'd').toDate();
        return Converter.getDateObj(item.end).getTime() <= dateCouldBeExtended.getTime();
    }

    static isItemExpired(item: Item): boolean {
        if (Comparator.isEmpty(item)) {
            return false;
        }

        let today: Date = new Date();
        today = moment(today).startOf('day').toDate();

        return Converter.getDateObj(item.end).getTime() < today.getTime();
    }
}
