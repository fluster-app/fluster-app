export interface SelectHobbiesGroupKey {
    key: string;
    keyTranslation: string;
    selected: boolean;
}

export interface SelectHobbiesGroup {
    titleKey: string;
    keys: SelectHobbiesGroupKey[];
}

export interface SelectHobbiesResult {
    sports: string[];
    arts: string[];
    food: string[];
    places: string[];
}
