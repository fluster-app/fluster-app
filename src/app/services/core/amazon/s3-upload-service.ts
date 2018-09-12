import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';

// Resources and utils
import {Resources} from '../utils/resources';

// Services
import {LocalFilesService} from '../../native/localfiles/local-files-service';
import {AccessTokenBody, AccessTokenService} from '../user/access-token-service';

@Injectable({
    providedIn: 'root'
})
export class S3UploadService {

    constructor(private httpClient: HttpClient,
                private localFilesService: LocalFilesService,
                private accessTokenService: AccessTokenService) {

    }

    upload(imgName: string, imgURI: string): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            const headers: HttpHeaders = new HttpHeaders();
            headers.append('Content-Type', 'application/json');

            const body: AccessTokenBody = await this.accessTokenService.getRequestBody();
            body['imgName'] = imgName;
            body['contentType'] = Resources.Constants.PHOTO.MIME_TYPE;

            this.httpClient.post(Resources.Constants.API.IMAGES_SIGNED_URL, body, {headers: headers})
                .subscribe((data: Communication.S3Url) => {
                    this.uploadToS3(data.url, imgURI).then((response: string) => {
                        resolve(response);
                    }, (errorResponse: string) => {
                        reject(errorResponse);
                    });
                }, (errorResponse: HttpErrorResponse) => {
                    reject(errorResponse);
                });
        });
    }

    private uploadToS3(preSignedUrl: string, imgURI: string): Promise<{}> {
        const headers: HttpHeaders = new HttpHeaders();
        headers.append('Content-Type', Resources.Constants.PHOTO.MIME_TYPE);

        return new Promise((resolve, reject) => {

            try {
                this.localFilesService.readFile(imgURI).then((blobImg: Blob) => {
                    this.httpClient.put(preSignedUrl, blobImg, {headers: headers, responseType: 'text'})
                        .subscribe((response: string) => {
                            resolve(response);
                        }, (errorResponse: string) => {
                            reject(errorResponse);
                        });
                }, (err: Error) => {
                    reject(err);
                });
            } catch (e) {
                // In case dataUriToBlob goes wrong
                reject(e);
            }

        });
    }

    //removeIf(production)

    uploadMockup(): Promise<{}> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    //endRemoveIf(production)
}
