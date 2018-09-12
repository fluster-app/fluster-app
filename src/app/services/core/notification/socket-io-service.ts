import {Injectable} from '@angular/core';

import * as io from 'socket.io-client';

// Model
import {Resources} from '../../core/utils/resources';
import {AccessToken} from '../../model/user/user';

@Injectable({
    providedIn: 'root'
})
export class SocketIoService {

    private socket: SocketIOClient.Socket;

    connect(accessToken: AccessToken): Promise<{}> {
        return new Promise((resolve) => {
            this.socket = io.connect(Resources.Constants.API.SERVER_DOMAIN, {
                'transports': ['websocket', 'xhr-polling'],
                'secure': true, 'rejectUnauthorized': false,
                'query': 'apiAccessToken=' + accessToken.apiAccessToken + '&userId=' + accessToken.userId
            });

            resolve();
        });
    }

    on(eventName: string, callback) {
        if (this.socket != null) {
            this.socket.on(eventName, callback);
        }
    }

    off(eventName: string) {
        if (this.socket != null) {
            this.socket.off(eventName);
        }
    }

    emit(eventName: string, data, callback?) {
        if (this.socket != null) {
            this.socket.emit(eventName, data, callback);
        }
    }

    private removeAllListeners() {
        if (this.socket != null) {
            this.socket.removeAllListeners();
        }
    }

    private disconnect() {
        if (this.socket != null) {
            this.socket.disconnect();
        }
    }

    close(): Promise<{}> {
        return new Promise((resolve) => {
            this.removeAllListeners();
            this.disconnect();
            resolve();
        });
    }
}
