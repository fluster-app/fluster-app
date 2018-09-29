import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {TranslateModule} from '@ngx-translate/core';

import {NewAdPage} from './new-ad.page';

import {NewAdStepLocationModule} from '../../../components/advertise/new-ad/new-ad-step-location/new-ad-step-location.module';
import {NewAdStepPhotoModule} from '../../../components/advertise/new-ad/new-ad-step-photo/new-ad-step-photo.module';
import {NewAdStepAvailabilityModule} from '../../../components/advertise/new-ad/new-ad-step-availability/new-ad-step-availability.module';
import {NewAdStepShareSizeModule} from '../../../components/advertise/new-ad/new-ad-step-share-size/new-ad-step-share-size.module';
import {NewAdStepSizeModule} from '../../../components/advertise/new-ad/new-ad-step-size/new-ad-step-size.module';
import {NewAdStepPriceModule} from '../../../components/advertise/new-ad/new-ad-step-price/new-ad-step-price.module';
import {NewAdStepAttributesModule} from '../../../components/advertise/new-ad/new-ad-step-attributes/new-ad-step-attributes.module';
import {NewAdStepAttendanceModule} from '../../../components/advertise/new-ad/new-ad-step-attendance/new-ad-step-attendance.module';
import {NewAdStepDoneModule} from '../../../components/advertise/new-ad/new-ad-step-done/new-ad-step-done.module';
import {NewAdStepTypeModule} from '../../../components/advertise/new-ad/new-ad-step-type/new-ad-step-type.module';
import {NewAdStepLifestyleModule} from '../../../components/advertise/new-ad/new-ad-step-lifestyle/new-ad-step-lifestyle.module';

const routes: Routes = [
    {
        path: '',
        component: NewAdPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        NewAdStepTypeModule,
        NewAdStepLocationModule,
        NewAdStepPhotoModule,
        NewAdStepAvailabilityModule,
        NewAdStepShareSizeModule,
        NewAdStepSizeModule,
        NewAdStepPriceModule,
        NewAdStepAttributesModule,
        NewAdStepAttendanceModule,
        NewAdStepDoneModule,
        NewAdStepLifestyleModule
    ],
    declarations: [NewAdPage]
})
export class NewAdPageModule {
}
