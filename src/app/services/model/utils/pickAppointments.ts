export interface PickAppointmentDate {
    pickDate: Date;
    displayDate: string;
    selected: boolean;
    hasTimeSlot: boolean;
}

export interface PickAppointmentTime {
    pickDate: Date;
    filterIndex: number;

    startTime: Date;

    selected: boolean;

    highlighted: boolean;
}

export interface PickAppointmentExistingDates {
    scheduledDates: number[];
    unavailableAppointmentDates: number[];
}
