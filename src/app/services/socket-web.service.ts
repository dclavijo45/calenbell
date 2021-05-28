import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import SocketInstance from 'socket.io-client';
import { Socket } from 'socket.io-client'; // Interface
import { ISocketMessage } from '../interfaces/i-socket-message';
import { environment } from '../../environments/environment';
import { ReasonDisconnectionSocket } from '../interfaces/reason-disconnection-socket';

@Injectable({
    providedIn: 'root'
})

export class SocketWebService {

    public detectNewMessage: Subject<ISocketMessage> = new Subject<ISocketMessage>();

    public listenerNewMessage(): Observable<ISocketMessage> {
        return this.detectNewMessage.asObservable();
    }

    public statusConnection: boolean = false;

    public reasonDisconnection: number = null;

    private ioSocket: Socket;

    public connectServerSocket(token: string): void {
        /***
         * @TODO Use token for query as auth. Connect to server (if is not connected) and listen events when connect to server and disconnec to server
         */

        if (this.statusConnection === false) {
            this.ioSocket = SocketInstance(environment._serverSocket, {
                query: {
                    token: token
                }
            })

            this.ioSocket.connect();
        }

        this.listenConnectSocket();
        this.listenDisconnectSocket();
        this.listenMessages();
    }

    public disconnectServerSocket(): void {
        this.ioSocket.disconnect();
    }

    private listenDisconnectSocket(): void {
        this.ioSocket.on('disconnect', (reason) => {
            this.statusConnection = false;
        });

        this.ioSocket.on('kick', (reason: ReasonDisconnectionSocket) => {
            this.statusConnection = false;
            this.reasonDisconnection = reason.reason;
            this.disconnectServerSocket();
        });
    }

    private listenConnectSocket(): void {
        this.ioSocket.on('connect', () => {
            this.statusConnection = true;
        });
    }

    private listenMessages(): void {
        this.ioSocket.on('message', (data: ISocketMessage) => {
            this.detectNewMessage.next(data)
        });
    }

    public emit(channel: string, data: any) {
        this.ioSocket.emit(channel, data);
    }

    public joinGroup(token: string): void {
        this.ioSocket.emit('join-group', {
            data: {
                token
            }
        });
    }
}
