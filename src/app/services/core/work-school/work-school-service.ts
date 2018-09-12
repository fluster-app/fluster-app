import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';

// Model
import WorkSchool = Communication.WorkSchool;

// Utils
import {Resources} from '../utils/resources';

// Services
import {AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class WorkSchoolService {

    constructor(private httpClient: HttpClient,
                private accessTokenService: AccessTokenService) {

    }

    findEducations(school: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();
                params = params.append('school', school);

                this.httpClient.get(Resources.Constants.API.EDUCATIONS, {params: params})
                    .subscribe((data: WorkSchool[]) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    findEmployers(employer: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                let params: HttpParams = await this.accessTokenService.getHttpParams();
                params = params.append('employer', employer);

                this.httpClient.get(Resources.Constants.API.EMPLOYERS, {params: params})
                    .subscribe((data: WorkSchool[]) => {
                        resolve(data);
                    }, (errorResponse: HttpErrorResponse) => {
                        reject(errorResponse);
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

}
