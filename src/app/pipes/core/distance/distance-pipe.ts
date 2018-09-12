import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'trimDistance'})
export class TrimDistancePipe implements PipeTransform {

    constructor() {

    }

    transform(input: number): number {

        if (input == null || input <= 0) {
            return input;
        }

        return Math.round(input);
    }
}
