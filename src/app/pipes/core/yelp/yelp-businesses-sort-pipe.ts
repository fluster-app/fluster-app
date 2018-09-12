import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'orderYelpBusinessesByDistance'})
export class YelpBusinessesSortPipe implements PipeTransform {

    transform(input: Yelp.YelpBusiness[]): any {
        if (input == null || input.length === 0) {
            return input;
        }

        const sortedYelp: Yelp.YelpBusiness[] = input.sort((a: Yelp.YelpBusiness, b: Yelp.YelpBusiness) => {
            return a.distance - b.distance;
        });

        return sortedYelp;
    }
}
