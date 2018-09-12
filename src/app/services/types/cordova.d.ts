// https://forum.ionicframework.com/t/cordova-plugins-supported-in-ionic-2/42070/10
// https://forum.ionicframework.com/t/ionic-2-with-ng-cordova/36103/24

interface CordovaResumeEvent extends Event {
    pendingResult: CordovaPendingResult;
}

interface CordovaPendingResult {
    pluginServiceName: string;
    pluginStatus: string;
    result: string;
}

declare var cordova: Cordova;

interface Cordova {
    plugins: CordovaPlugins;
    file: any;
}

interface WindowPlugins {
    calendar: ICalendarService;
}

interface GoogleAnalytics {
    // Just to test if plugin is already loaded before firing events
}

interface Window {
    plugins: WindowPlugins;
    cordova: Cordova;
    analytics: GoogleAnalytics;
}

interface CordovaPlugins {
    diagnostic: Diagnostic;
}

interface Diagnostic {

    // SuccessCallback give the answer. True if permission on or false for permission off
    isCalendarAuthorized(successCallback: (authorized: boolean) => void,
                         errorCallback: (error: string) => void): void;
}

interface ICalendarOptions {
    startDate: Date;
    endDate?: Date;
    title: string;
    location?: string;
    notes?: string;
    calendarName?: string;
}

interface ICalendarOptionsModify {
    startDate: Date;
    endDate?: Date;
    title: string;
    location?: string;
    notes?: string;
    newTitle: string;
    newLocation: string;
    newNotes: string;
    newStartDate: Date;
    newEndDate: Date;
}

interface ICalendarService {
    // New version
    createEvent(title: string, eventLocation: string, notes: string, startDate: Date, endDate: Date, success: any, error: any);

    deleteEvent(title: string, eventLocation: string, notes: string, startDate: Date, endDate: Date, success: any, error: any): Promise<string>;

    findEvent(title: string, eventLocation: string, notes: string, startDate: Date, endDate: Date, success: any, error: any): Promise<string>;
}

