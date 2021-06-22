import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import SocketInstance from 'socket.io-client';
import { Socket } from 'socket.io-client'; // Interface
import { ISocketMessage } from '../interfaces/i-socket-message';
import { environment } from '../../environments/environment';
import { ReasonDisconnectionSocket } from '../interfaces/reason-disconnection-socket';
import { IChats } from '../interfaces/i-chats';
import { IInfoSentMessage } from '../interfaces/i-info-sent-message';
import { IContactsChat } from '../interfaces/i-contacts-chat';
import { SetScrollService } from './set-scroll.service';
import { TokenAuthStateService } from './token-auth-state.service';
import { InfoProfileService } from './info-profile.service';
import notie from 'notie';
import {
    DialogLayoutDisplay,
    ToastNotificationInitializer
} from '@costlydeveloper/ngx-awesome-popup';
import { IResponseInitChat } from '../interfaces/i-response-init-chat';
import { ClientService } from './client.service';
import { IResponseGetContactsG } from '../interfaces/i-response-get-contactsg';
import { NotifyModeShow } from '../interfaces/notify-mode-show';

@Injectable({
    providedIn: 'root'
})

export class SocketWebService {

    constructor(private setScrollSvc: SetScrollService,
        private _auth: TokenAuthStateService,
        private infoProfileSvc: InfoProfileService,
        private _client: ClientService) {

        setTimeout(() => {
            this.CHATS = JSON.parse(localStorage.getItem('chats')) || [];

            // check messages without read
            this.checkMessagesWithoutRead();
        }, 1000);

        // verify chats user login
        this._auth.isLoggedIn().subscribe(
            (status: boolean) => {
                if (status) {
                    // Get contacts
                    this.getContacts();

                    setTimeout(() => {
                        const latest_user: string = localStorage.getItem('latest_user');

                        // check user
                        if (latest_user) {
                            // clean chats
                            if (parseInt(latest_user) != this.infoProfileSvc.info_profile.id) {
                                localStorage.removeItem('chats');

                                this.CHATS = [];
                            };

                            // reset latest_user
                            localStorage.setItem('latest_user', this.infoProfileSvc.info_profile.id.toString());
                        } else {
                            // set id logged
                            localStorage.setItem('latest_user', this.infoProfileSvc.info_profile.id.toString())
                        };

                    }, 1000);
                }
            }
        );

        // listen new messages from socket server
        this.listenerNewMessage().subscribe(
            (message: ISocketMessage) => {

                // Validate if chat with user and type message
                const findChat: IChats = message.type == 1 ?
                    this.CHATS.find((chat) => chat.subject.id_subject == message.transmitter && chat.type == message.type) :
                    this.CHATS.find((chat) => chat.subject.id_subject == message.id_group && chat.type == message.type);

                const findContact: IContactsChat = message.type == 1 ? this.CONTACTS.find((contact) => contact.id_contact_g == message.transmitter) :
                    this.CONTACTS.find((contact) => contact.id_contact_g == message.id_group);

                const read: boolean = this.infoSentMessage.typeMessage == 1 ?
                    this.infoSentMessage.subject.id_subject == message.transmitter && this.infoSentMessage.typeMessage == message.type ? true : false :
                    this.infoSentMessage.subject.id_subject == message.id_group && this.infoSentMessage.typeMessage == message.type ? true : false;

                if (this.CHATS.includes(findChat)) {

                    // validate if chat group or one-one
                    if (message.type == 1) {
                        this.CHATS[this.CHATS.indexOf(findChat)].messages.push({
                            text: message.message,
                            read,
                            by_me: false,
                            subject: {
                                id_subject: message.transmitter,
                                name: findContact.name,
                                photo: findContact.photo,
                                online: false
                            }
                        });

                        // show notification if not read
                        if (!read) {
                            this.toastNotification(findContact.name, message.message, message.type);
                        };

                    } else {
                        this.CHATS[this.CHATS.indexOf(findChat)].messages.push({
                            text: message.message,
                            read,
                            by_me: false,
                            subject: {
                                id_subject: message.transmitter,
                                name: message.info_profile_group.name,
                                photo: message.info_profile_group.photo,
                                online: message.info_profile_group.online
                            }
                        });

                        // show notification if not read
                        if (!read) {
                            this.toastNotification(findContact.name, message.message, message.type);
                        };
                    }

                } else {

                    // validate if chat group or one-one
                    if (message.type == 1) {
                        this.CHATS.push({
                            type: message.type,
                            subject: {
                                photo: findContact.photo,
                                id_subject: message.transmitter,
                                name: findContact.name,
                                online: false
                            },
                            messages: [
                                {
                                    text: message.message,
                                    read,
                                    by_me: false,
                                    subject: {
                                        photo: findContact.photo,
                                        id_subject: message.transmitter,
                                        name: findContact.name,
                                        online: false
                                    }
                                }
                            ]
                        });

                        // show notification if not read
                        if (!read) {
                            this.toastNotification(findContact.name, message.message, message.type);
                        };
                    } else {
                        this.CHATS.push({
                            type: message.type,
                            subject: {
                                photo: findContact.photo,
                                id_subject: findContact.id_contact_g,
                                name: findContact.name,
                                online: null
                            },
                            messages: [
                                {
                                    text: message.message,
                                    read,
                                    by_me: false,
                                    subject: {
                                        photo: message.info_profile_group.photo,
                                        id_subject: message.transmitter,
                                        name: message.info_profile_group.name,
                                        online: message.info_profile_group.online
                                    }
                                }
                            ]
                        });

                        // show notification if not read
                        if (!read) this.toastNotification(findContact.name, message.message, message.type);
                    };

                };

                // check messages without read
                this.checkMessagesWithoutRead();

                // Set scroll to end and update localstorage
                setTimeout(() => {
                    this.setScrollSvc.setScroll(true);

                    // update localstorage
                    localStorage.setItem('chats', JSON.stringify(this.CHATS))
                }, 200);

            }
        );

        // get config notify mode show
        if (!localStorage.getItem('config_notify')) {
            const config: NotifyModeShow = {
                msg_group: true,
                msg_one_one: true
            };

            localStorage.setItem('config_notify', JSON.stringify(config));
        } else {
            const config: NotifyModeShow = JSON.parse(localStorage.getItem('config_notify'));

            this.NOTIFY = config;
        }
    }

    NOTIFY: NotifyModeShow = {
        msg_group: true,
        msg_one_one: true
    }

    private _server: string = this._client._server;

    loadingGettingContacts: boolean = true;

    CHATS: IChats[] = [];

    chatsWithoutRead: number = 0;

    CONTACTS: IContactsChat[] = [];

    infoSentMessage: IInfoSentMessage = {
        subject: {
            name: null,
            photo: null,
            online: null,
            id_subject: null
        },
        typeMessage: null,
        token: null
    };

    detectNewMessage: Subject<ISocketMessage> = new Subject<ISocketMessage>();

    listenerNewMessage(): Observable<ISocketMessage> {
        return this.detectNewMessage.asObservable();
    }

    checkMessagesWithoutRead(): void {
        this.chatsWithoutRead = 0;

        this.chatsWithoutRead = this.CHATS.reduce((acc, chat) => {
            acc += chat.messages.reduce((acc2, msg) => {
                if (!msg.read) acc2++;

                return acc2;
            }, 0);

            return acc;
        }, 0);

    }

    statusConnection: boolean = false;

    reasonDisconnection: number = null;

    private ioSocket: Socket;

    connectServerSocket(token: string): void {
        /***
         * @TODO Use token for query as auth. Connect to server (if is not connected) and listen events when connect to server and disconnec to server
         */

        if (this.statusConnection === false) {
            this.ioSocket = SocketInstance(environment._serverSocket, {
                query: {
                    token: token
                }
            });

            this.ioSocket.connect();
        };

        this.listenConnectSocket();
        this.listenDisconnectSocket();
        this.listenMessages();
    }

    disconnectServerSocket(): void {
        this.ioSocket.disconnect();
    }

    private listenDisconnectSocket(): void {
        this.ioSocket.on('disconnect', (reason) => this.statusConnection = false);

        this.ioSocket.on('kick', (reason: ReasonDisconnectionSocket) => {
            this.statusConnection = false;
            this.reasonDisconnection = reason.reason;
            this.disconnectServerSocket();
        });
    }

    private listenConnectSocket(): void {
        this.ioSocket.on('connect', () => this.statusConnection = true);
    }

    private listenMessages(): void {
        this.ioSocket.on('message', (data: ISocketMessage) => this.detectNewMessage.next(data));
    }

    emit(channel: string, data: any) {
        this.ioSocket.emit(channel, data);
    }

    joinGroup(token: string): void {
        this.ioSocket.emit('join-group', {
            data: {
                token
            }
        });
    }

    /**
     * @TODO Print notification
     * 
     * @PARAM [nameSubject] : Name subject received from message
     * @PARAM [message] : message received 
     * @PARAM [typeMessage] : type message received, 1 = one-one, 2 = group
     */
    toastNotification(nameSubject: string, message: string, typeMessage: number) {
        const newToastNotification = new ToastNotificationInitializer();

        newToastNotification.setTitle('Nuevo mensaje!');

        newToastNotification.setMessage(`<b>${nameSubject}</b>: ${message.length >= 10 ? message.slice(0, 10) + '...' : message}`);

        // Choose settings
        newToastNotification.setConfig({
            TextPosition: 'right',
            ProgressBar: 0,
            AllowHTMLMessage: true,
            AutoCloseDelay: 4500,
            LayoutType: DialogLayoutDisplay.SUCCESS
        });

        if (this.NOTIFY.msg_group && typeMessage == 2) {
            newToastNotification.openToastNotification$();
        };

        if (this.NOTIFY.msg_one_one && typeMessage == 1) {
            newToastNotification.openToastNotification$();
        };
    }

    getContacts(): void {
        // reset contacts list
        this.CONTACTS = [];

        this._client.getRequest(`${this._server}/user/manage/contactsg`, localStorage.getItem('token')).subscribe(
            (res: IResponseGetContactsG) => {
                // verify auth
                res.auth_token == false ? this._auth.logout() : true;

                // saving contacts to list
                res.contacts.forEach((contact) => {
                    this.CONTACTS.push({
                        type: contact.type,
                        id_contact_g: contact.id,
                        name: contact.name,
                        photo: contact.photo
                    });
                });

                this.loadingGettingContacts = false;

                // joining to group to socket server
                this.CONTACTS.forEach((contact) => {
                    if (contact.type == 2) {
                        this._client.postRequest(`${this._server}/user/init/chat`, {
                            chat_type: contact.type,
                            receiver: contact.id_contact_g,
                            group: contact.id_contact_g
                        },
                            localStorage.getItem('token')).subscribe(
                                (res: IResponseInitChat) => {

                                    res.auth_token == false ? this._auth.logout() : true;

                                    const token: string = res.token;

                                    this.emit('join-group', {
                                        data: {
                                            token
                                        }
                                    });
                                },
                                (error) => {
                                    console.log("****ERROR****");
                                    console.log(error);

                                    const Notify = new Promise((resolve) => {
                                        notie.alert({
                                            type: 'error',
                                            text: "No hay internet",
                                            stay: false,
                                            time: 3,
                                            position: "top"
                                        });
                                        setTimeout(function () {
                                            resolve(true);
                                        }, 2000);
                                    })
                                    Notify.then((e) => {
                                        console.error("INTERNET ERROR");
                                    });
                                }
                            );
                    };
                });

            },
            (error) => {
                console.log("***ERROR***");
                console.log(error);

                this.loadingGettingContacts = false;
            }
        );
    }

    setNotifyChange(type: number, status: boolean): void {
        const currentConfig: NotifyModeShow = JSON.parse(localStorage.getItem('config_notify'));

        const config: NotifyModeShow = {
            msg_one_one: type == 1 ? status : currentConfig.msg_one_one,
            msg_group: type == 2 ? status : currentConfig.msg_group
        };

        localStorage.setItem('config_notify', JSON.stringify(config));

        this.NOTIFY = config;
    }
}
