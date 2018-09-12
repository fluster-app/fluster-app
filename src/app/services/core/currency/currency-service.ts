import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

import {TranslateService} from '@ngx-translate/core';

// Resources and utils
import {Comparator} from '../../core/utils/utils';

// Source: http://country.io/currency.json

// Source: https://github.com/xsolla/currency-format
export interface CurrencyFormat {
    name: string;
    fractionSize: number;
    symbol: {
        grapheme: string;
        template: string;
        rtl: boolean;
    };
    uniqSymbol: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {

    private currencyCountry: string;
    private currency: string;
    private format: CurrencyFormat;

    constructor(private httpClient: HttpClient,
                private translateService: TranslateService) {

    }

    initDefaultCurrency(country: string): Promise<{}> {
        return new Promise((resolve) => {

            // Load only when necessary, not many times if same country
            if (country == null || (this.currencyCountry != null && Comparator.equals(this.currencyCountry, country))) {
                resolve();
            } else {
                this.currencyCountry = country;

                this.initCurrency(country).then(() => {
                    resolve();
                });
            }
        });
    }

    private initCurrency(country: string): Promise<{}> {

        return new Promise((resolve) => {
            if (Comparator.isStringEmpty(country)) {
                resolve();
            } else {
                this.findCountryCurrency(country.toUpperCase()).then((foundCurrency: string) => {
                    if (foundCurrency != null) {
                        this.currency = foundCurrency;

                        this.findCurrencyFormat(foundCurrency).then((currencyFormat: CurrencyFormat) => {
                            this.format = currencyFormat;

                            resolve();
                        });
                    }
                });
            }
        });
    }

    private findCurrencyFormat(foundCurrency: string): Promise<{}> {
        return new Promise((resolve) => {
            this.httpClient.get('./assets/currency/currency-format.json')
                .subscribe((res: CurrencyFormat[]) => {
                    if (Comparator.isEmpty(res)) {
                        resolve(null);
                    }

                    this.filterCountryFormat(foundCurrency, res).then((currencyFormat: CurrencyFormat) => {
                        resolve(currencyFormat);
                    });
                });
        });
    }

    private filterCountryFormat(foundCurrency: string, formatList: CurrencyFormat[]): Promise<{}> {
        return new Promise((resolve) => {
            Object.keys(formatList).map((key) => {

                if (Comparator.equals(key, foundCurrency)) {
                    resolve(formatList[key]);
                }
            });

            resolve(null);
        });
    }

    private findCountryCurrency(country: string): Promise<{}> {
        return new Promise((resolve) => {
            this.httpClient.get('./assets/currency/currency-country.json')
                .subscribe((res: string[]) => {
                    if (Comparator.isEmpty(res)) {
                        resolve(null);
                    }

                    this.filterCountryCurrency(country, res).then((currencyCountry: string) => {
                        resolve(currencyCountry);
                    });
                }, (errorResponse: HttpErrorResponse) => {
                    resolve(null);
                });
        });
    }

    private filterCountryCurrency(country: string, countryList: string[]): Promise<{}> {
        return new Promise((resolve) => {
            Object.keys(countryList).map((key) => {
                if (Comparator.equals(key, country)) {
                    resolve(countryList[key]);
                }
            });

            resolve(null);
        });
    }

    getCurrencyFormat(): CurrencyFormat {
        return this.format;
    }

    getCurrency(): string {
        return this.currency;
    }

    transformToLocaleString(input: any): string {
        if (this.format == null) {
            return input;
        }

        if (input === null) {
            return input;
        }

        if (!Comparator.isEmpty(this.format.symbol)) {
            let template: string = this.format.symbol.template;

            template = template.replace('$', this.format.symbol.grapheme);

            return template.replace('1', input.toLocaleString(this.translateService.getBrowserCultureLang()));
        } else if (!Comparator.isStringEmpty(this.currency)) {
            return input.toLocaleString(this.translateService.getBrowserCultureLang()) + ' ' + this.currency;
        } else {
            return input;
        }
    }

}
