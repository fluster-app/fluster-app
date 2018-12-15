import {ErrorHandler} from '@angular/core';

import {environment} from '../../../../environments/environment';

import * as Raven from 'raven-js';

// Resources
import {Resources} from '../../core/utils/resources';

try {
    Raven
        .config(Resources.Constants.SENTRY.DSN, {
            release: Resources.Constants.APP_VERSION,
            environment: environment.environment
        })
        .install();
} catch (err) {
    // Raven throw an error in case Resources.Constants.SENTRY.DSN is not defined
    console.error('Sentry not initialized');
}

export class SentryErrorHandler extends ErrorHandler {

    handleError(err: any): void {
        super.handleError(err);

        //removeIf(production)
        if (environment.production) {
            //endRemoveIf(production)
        Raven.captureException(err);
            //removeIf(production)
        }
        //endRemoveIf(production)
            }
}
