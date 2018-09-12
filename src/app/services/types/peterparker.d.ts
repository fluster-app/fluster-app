declare module Communication {

    export interface ItemStatistics {
        likes: number;
        dislikes: number;
    }

    export interface LikeCount {
        count: number;
    }

    export interface LikeStatus {
        status: boolean;
    }

    export interface TargetedUsersStatistics {
        users: number;
    }

    export interface S3Url {
        url: string;
    }

    export interface TargetedUsersStatisticsError {
        status: number;
        statusText: string;
        _body: string;
    }

    export interface ErrorBodyResponse {
        error: MongoError;
    }

    export interface MongoError {
        name: string;
        message: string;
        code: number;
    }

    export interface MongoUpdate {
        n: number;
        nModified: number;
        ok: number;
    }

    export interface PushUpdate {
        success: boolean;
    }

    export interface AnonymizeUser {
        success: boolean;
    }

    export interface UserSpotifyId {
        userSpotifyId: string;
    }

    export interface WorkSchoolDescription {
        employer: string;
    }

    export interface WorkSchool {
        name?: string;
        _id?: WorkSchoolDescription;
    }
}
