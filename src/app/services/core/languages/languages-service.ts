import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {forkJoin} from 'rxjs';

// Utils
import {Comparator} from '../../core/utils/utils';

export interface Language {
    code: string;
    name: string;
    nativeName: string;
}

export interface Languages {
    languages: Language[];
}

@Injectable({
    providedIn: 'root'
})
export class LanguagesService {

    constructor(private httpClient: HttpClient) {
    }

    loadLanguages(): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.httpClient.get('./assets/lang/languages.json')
                .subscribe((res: Languages) => {
                    resolve(res != null ? res.languages : new Array());
                }, (error: any) => {
                    reject(error);
                });
        });
    }

    private findCodeNativeName(languages: Language[], code: string): Promise<{}> {
        return new Promise((resolve) => {
            Object.keys(languages).map((key) => {
                if (Comparator.equals(languages[key].code, code)) {
                    resolve(languages[key]);
                }
            });

            resolve(null);
        });
    }

    findLanguages(userLanguages: string[]): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.loadLanguages().then((languages: Language[]) => {
                this.findCodeNativeLanguages(languages, userLanguages).then((result: Language[]) => {
                    resolve(result);
                }, (err: any) => {
                    reject(err);
                });
            }, (err: any) => {
                reject(err);
            });
        });
    }

    private findCodeNativeLanguages(languages: Language[], userLanguages: string[]): Promise<{}> {
        return new Promise((resolve, reject) => {
            const promises = new Array();

            for (let i: number = 0; i < userLanguages.length; i++) {
                promises.push(this.findCodeNativeName(languages, userLanguages[i]));
            }

            forkJoin(promises).subscribe(
                (data: Language[]) => {
                    resolve(data);
                },
                (err: any) => {
                    reject(new Array());
                }
            );
        });
    }
}
