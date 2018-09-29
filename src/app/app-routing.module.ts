import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {AppRoutingPreloaderService} from './services/core/routing/app-routing-preloader.service';

const routes: Routes = [
    {path: 'login', loadChildren: './pages/core/login/login.module#LoginPageModule'},
    {path: 'first-choice', loadChildren: './pages/core/first-choice/first-choice.module#FirstChoicePageModule'},
    {path: 'user-profile', loadChildren: './pages/core/user-profile/user-profile.module#UserProfilePageModule'},
    {path: 'app-params', loadChildren: './pages/core/app-params/app-params.module#AppParamsPageModule'},
    {path: 'chat', loadChildren: './pages/core/chat/chat.module#ChatPageModule'},
    {path: 'items', loadChildren: './pages/browse/items/items/items.module#ItemsPageModule'},
    {
        path: 'item-details',
        loadChildren: './pages/browse/items/item-details/item-details.module#ItemDetailsPageModule',
        data: {preload: true}
    },
    {path: 'item-params', loadChildren: './pages/browse/item-params/item-params.module#ItemParamsPageModule'},
    {
        path: 'my-appointments-items',
        loadChildren: './pages/browse/my-items/my-appointments-items/my-appointments-items.module#MyAppointmentsItemsPageModule'
    },
    {
        path: 'my-bookmarks-items',
        loadChildren: './pages/browse/my-items/my-bookmarks-items/my-bookmarks-items.module#MyBookmarksItemsPageModule'
    },
    {path: 'my-applicants', loadChildren: './pages/browse/my-items/my-applicants/my-applicants.module#MyApplicantsPageModule'},
    {
        path: 'ads-next-appointments',
        loadChildren: './pages/advertise/ads/ads-next-appointments/ads-next-appointments.module#AdsNextAppointmentsPageModule'
    },
    {path: 'new-ad', loadChildren: './pages/advertise/new-ad/new-ad.module#NewAdPageModule'},
    {path: 'applicants', loadChildren: './pages/advertise/ads/applicants/applicants.module#ApplicantsPageModule'},
    {path: 'ads-details', loadChildren: './pages/advertise/ads/ads-details/ads-details.module#AdsDetailsPageModule'},
    {
        path: 'applicant-selection',
        loadChildren: './pages/advertise/applicant/applicant-selection/applicant-selection.module#ApplicantSelectionPageModule'
    },
    {path: 'ads-close', loadChildren: './pages/advertise/ads-close/ads-close.module#AdsClosePageModule'},
    {
        path: 'admin-appointments',
        loadChildren: './pages/advertise/admin/admin-appointments/admin-appointments.module#AdminAppointmentsPageModule'
    },
    {path: 'admin-limitation', loadChildren: './pages/advertise/admin/admin-limitation/admin-limitation.module#AdminLimitationPageModule'},
    {path: 'candidates', loadChildren: './pages/advertise/ads/candidates/candidates.module#CandidatesPageModule'},
    {path: 'candidate-details', loadChildren: './pages/advertise/candidate-details/candidate-details.module#CandidateDetailsPageModule'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {preloadingStrategy: AppRoutingPreloaderService})],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
