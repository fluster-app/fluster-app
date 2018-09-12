import * as _ from 'underscore';
import {FormControl} from '@angular/forms';

// Utils
import {Resources} from './resources';

export class Comparator {

    static isEmpty(obj: any): boolean {
        return obj == null || Object.keys(obj).length === 0;
    }

    static isNumberNullOrZero(obj: number): boolean {
        return obj == null || obj === 0;
    }

    static equals(obj1: any, obj2: any): boolean {
        return _.isEqual(obj1, obj2);
    }

    static isStringEmpty(str: string): boolean {
        return !str || 0 === str.length;
    }

    static isStringBlank(str: string): boolean {
        return !str || /^\s*$/.test(str);
    }

    static isBiggerThanZero(num: any): boolean {
        return Comparator.isNumber(num) && num > 0;
    }

    static isNumber(num: any): boolean {
        return num != null && num !== undefined && !isNaN(parseFloat(num)) && isFinite(num);
    }

    static hasElements(obj: any[]): boolean {
        return !this.isEmpty(obj) && obj.length > 0;
    }
}

export class Converter {

    static getAge(birthday: Date): number {
        if (birthday == null) {
            return Resources.Constants.ITEM.USER_RESTRICTIONS.AGE.MIN;
        }

        const ageDifMs = Date.now() - Converter.getDateObj(birthday).getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    static getDateObj(myDate: any): Date {
        if (myDate == null) {
            return null;
        }

        if (myDate instanceof String || typeof myDate === 'string') {
            return new Date('' + myDate);
        }

        return myDate;
    }

    static roundCurrency(value: string): number {
        return Number(parseFloat(value).toFixed(2));
    }

    static dataURItoBlob(dataURI: string): Blob {
        const binary = atob(dataURI.split(',')[1]);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }

        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        return new Blob([new Uint8Array(array)], {
            type: mimeString
        });
    }

    static getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R: number = 6371; // Radius of the earth in km
        const dLat: number = this.deg2rad(lat2 - lat1);  // deg2rad below
        const dLon: number = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d: number = R * c; // Distance in km

        return d;
    }

    private static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    static getFlusterShareImgURL(square: boolean) {
        let sharedImgUrl: string = square ? Resources.Constants.SOCIAL_SHARING.FLUSTER_SHARE_IMG.URL.SQUARE :
            Resources.Constants.SOCIAL_SHARING.FLUSTER_SHARE_IMG.URL.STANDARD;

        const userLang: string = navigator.language.split('-')[0];
        if (!Comparator.isStringEmpty(userLang) && (Comparator.equals(userLang, 'de') ||
            Comparator.equals(userLang, 'fr') || Comparator.equals(userLang, 'it'))) {
            sharedImgUrl += '_' + userLang;
        }

        return sharedImgUrl + Resources.Constants.SOCIAL_SHARING.FLUSTER_SHARE_IMG.EXT;
    }

    static firstFileToBase64(fileImage: File): Promise<{}> {
        return new Promise((resolve, reject) => {
            const fileReader: FileReader = new FileReader();
            if (fileReader && fileImage != null) {
                fileReader.readAsDataURL(fileImage);
                fileReader.onload = () => {
                    resolve(fileReader.result);
                };

                fileReader.onerror = (error) => {
                    reject(error);
                };
            } else {
                reject(new Error('No file found'));
            }
        });
    }
}

export class Validator {

    static isNumber(control: FormControl): Promise<{}> {

        return new Promise((resolve) => {

            if (Comparator.isStringEmpty(control.value)) {
                resolve(null);
            }

            Comparator.isNumber(control.value) ? resolve(null) : resolve({isNumber: true});
        });
    }

    static generateRandomString(length: number): string {
        let text: string = '';
        const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i: number = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
}
