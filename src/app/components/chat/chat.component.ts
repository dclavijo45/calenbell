import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IChats, IMessagesList } from 'src/app/interfaces/i-chats';
import { IContactsChat } from 'src/app/interfaces/i-contacts-chat';
import { IInfoMyProfileChat } from 'src/app/interfaces/i-info-my-profile-chat';
import { IInfoSentMessage } from 'src/app/interfaces/i-info-sent-message';
import { IResponseGetContactsG } from 'src/app/interfaces/i-response-get-contactsg';
import { IResponseInitChat } from 'src/app/interfaces/i-response-init-chat';
import { ISocketMessage } from 'src/app/interfaces/i-socket-message';
import { ISocketSentMessage } from 'src/app/interfaces/i-socket-sent-message';
import { LoginResponse } from 'src/app/interfaces/login-response';
import { SearchContactsData } from 'src/app/interfaces/search-contacts-data';
import { SearchContactsResponse } from 'src/app/interfaces/search-contacts-response';
import notie from 'notie';
import { ClientService } from 'src/app/services/client.service';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';
import { SetScrollService } from 'src/app/services/set-scroll.service';
import { SocketWebService } from 'src/app/services/socket-web.service';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import { AddContactsRequest } from 'src/app/interfaces/add-contacts-request';
import { AddContactsResponse } from 'src/app/interfaces/add-contacts-response';
import { DeleteContactsResponse } from 'src/app/interfaces/delete-contacts-response';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Observable, Subscription } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {

    constructor(private _rootStatusPage: RootPageStatusService,
        public socketWebSvc: SocketWebService,
        private _client: ClientService,
        private _auth: TokenAuthStateService,
        private setScrollSvc: SetScrollService) { }

    private _server: string = this._client._server;

    // my profile
    public infoProfile: IInfoMyProfileChat = {
        name: 'Nombre ex 1',
        email: 'correox@domain.com',
        online: false,
        photo: 'https://image.shutterstock.com/image-vector/male-avatar-profile-picture-use-260nw-193292033.jpg',
        id: null
    }
    private info_profile_LC: LoginResponse = JSON.parse(localStorage.getItem('info_profile'));

    // chat
    public CHATS: IChats[] = []
    public inputFieldMessage: string = '';
    public infoSentMessage: IInfoSentMessage = {
        subject: {
            name: null,
            photo: null,
            online: null,
            id_subject: null
        },
        typeMessage: null,
        token: null
    };
    public isChatting: boolean = false;
    public loadingGetTokenSocket: boolean = false;
    @ViewChild('input1') InputMessage: ElementRef;

    // contacts
    public CONTACTS: IContactsChat[] = [];
    public BK_CONTACTS: IContactsChat[] = [];
    public isAddingContacts: boolean = false;
    public loadingSearchingContacts: boolean = false;
    public loadingGettingContacts: boolean = true;
    public inputSearchContacts: string = '';
    public inputFilterContacts: string = '';
    @ViewChild('input2') InputSearch: ElementRef;
    public resultSearchContacts: SearchContactsResponse = null;
    private subSearchContacts$: Subscription = null;

    // style effect
    public opacityView: number = 0;

    // Live cycle

    ngOnInit(): void {
        // init status tag
        this._rootStatusPage.changeRootPageNumberStatus(6);

        // Set info profile from LocalStg
        this.infoProfile.photo = this.info_profile_LC.photo;
        this.infoProfile.email = this.info_profile_LC.email;
        this.infoProfile.name = this.info_profile_LC.name
        this.infoProfile.id = this.info_profile_LC.id;

        // Get contactsG
        this.getContacts();
    }

    ngAfterViewInit(): void {
        // init view style
        this.initStyleEffect();

        // listen new messages from socket server
        this.socketWebSvc.listenerNewMessage().subscribe(
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
                    }

                    console.log(this.CHATS);


                }

                // Set scroll to end
                setTimeout(() => {
                    this.setScrollSvc.setScroll(true);
                }, 200);

            }
        );

    }

    ngOnDestroy(): void {
        // kill status tag
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

    // utils
    blurHideOptions(subMenu): void {
        setTimeout(() => {
            subMenu.style.visibility = 'hidden';
        }, 200);
    }

    hideOrShowOptions(subMenu): void {
        subMenu.style.visibility == 'hidden' ? subMenu.style.visibility = 'visible' : subMenu.style.visibility = 'hidden';
    }

    // Styles

    initStyleEffect(): Promise<boolean> {
        // style effect
        return new Promise((resolve) => {
            let intervalOpacityClear: Promise<boolean> = new Promise((resolve) => {
                setTimeout(() => {
                    this.opacityView = 1;
                    resolve(true);
                    clearInterval(deleteOpacity);
                }, 1000);

                let deleteOpacity = setInterval(() => {
                    this.opacityView -= 0.1;

                    if (this.opacityView <= 0) {
                        resolve(true);
                        clearInterval(deleteOpacity);
                    }
                }, 30);
            });

            intervalOpacityClear.then((res) => {

                let intervalOpacity: Promise<boolean> = new Promise((resolve) => {
                    setTimeout(() => {
                        this.opacityView = 1;
                        resolve(true);
                        clearInterval(addOpacity);
                    }, 1000);

                    let addOpacity = setInterval(() => {
                        this.opacityView += 0.1;

                        if (this.opacityView >= 1) {
                            resolve(true);
                            clearInterval(addOpacity);
                        }
                    }, 30);
                });

                intervalOpacity.then((res) => resolve(true));

            });
        });

    }

    // Chat

    initChat(id_contact_g: number, contact_type: number): void {
        // set style
        let styleInit: Promise<boolean> = this.initStyleEffect();
        styleInit.then((res) => {
            this.isChatting = true;
            this.isAddingContacts = false;
        });

        // set info contact message
        const findContact: IContactsChat = this.CONTACTS.find((contact) => contact.id_contact_g == id_contact_g && contact.type == contact_type);

        if (this.CONTACTS.includes(findContact)) {

            // set info contact to sent messages
            this.infoSentMessage.subject.id_subject = id_contact_g;
            this.infoSentMessage.subject.name = findContact.name;
            this.infoSentMessage.subject.photo = findContact.photo;
            this.infoSentMessage.subject.online = false;
            this.infoSentMessage.typeMessage = findContact.type;

            // get auth for socket
            this._client.postRequest(`${this._server}/user/init/chat`, {
                chat_type: findContact.type,
                receiver: findContact.id_contact_g,
                group: findContact.id_contact_g
            },
                localStorage.getItem('token')).subscribe(
                    (res: IResponseInitChat) => {

                        res.auth_token == false ? this._auth.logout() : true;

                        // res.invitation_status == 1 ? alert("are friends!") : alert("are not friends!");

                        this.infoSentMessage.token = res.token;
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

        } else {
            alert("Not find contact");
            return;
        };

        // check messages as read (only chat view --> subject)
        const findChat: IChats = this.CHATS.find((chat) => chat.subject.id_subject == id_contact_g && chat.type == contact_type);

        if (this.CHATS.includes(findChat)) {

            // Set messages of user as read
            const findMessages: IMessagesList[] = this.CHATS[this.CHATS.indexOf(findChat)].messages;

            findMessages.map((chat) => chat.read = true);

            // Set scroll to end
            setTimeout(() => {
                this.setScrollSvc.setScroll(true);
            }, 200);

        };

        // set focus input message
        setTimeout(() => {
            try {
                this.InputMessage.nativeElement.focus();
            } catch (e) {
            }
        }, 1000);

    }

    sendMessage(): void {
        if (this.inputFieldMessage.trim().length == 0) {
            return;
        };

        const data: ISocketSentMessage = this.infoSentMessage.typeMessage == 1 ? {
            message: this.inputFieldMessage,
            token: this.infoSentMessage.token
        } : {
            message: this.inputFieldMessage,
            token: this.infoSentMessage.token,
            info_profile_group: {
                photo: this.infoProfile.photo,
                online: false,
                name: this.infoProfile.name
            }
        }

        if (data.token != null) {
            // Validate if not exist chat

            const findChat: IChats = this.CHATS.find((chat) => chat.subject.id_subject == this.infoSentMessage.subject.id_subject && chat.type == this.infoSentMessage.typeMessage);

            if (this.CHATS.includes(findChat)) {
                this.CHATS[this.CHATS.indexOf(findChat)].messages.push({
                    text: this.inputFieldMessage,
                    read: true,
                    by_me: true,
                    subject: {
                        id_subject: this.infoProfile.id,
                        photo: this.infoProfile.photo,
                        online: false,
                        name: this.infoProfile.name
                    }
                });
            } else {
                this.CHATS.push({
                    type: this.infoSentMessage.typeMessage,
                    subject: {
                        photo: this.infoSentMessage.subject.photo,
                        name: this.infoSentMessage.subject.name,
                        id_subject: this.infoSentMessage.subject.id_subject,
                        online: false
                    },
                    messages: [
                        {
                            text: this.inputFieldMessage,
                            read: true,
                            by_me: true,
                            subject: {
                                id_subject: this.infoProfile.id,
                                photo: this.infoProfile.photo,
                                online: false,
                                name: this.infoProfile.name
                            }
                        }
                    ]
                });
            };

            // Send message to group or user
            this.infoSentMessage.typeMessage == 1 ? this.socketWebSvc.emit('message-one-one', { data }) : this.socketWebSvc.emit('message-group', { data })


            // Clean input message
            this.inputFieldMessage = '';

            // Set scroll to end
            setTimeout(() => {
                this.setScrollSvc.setScroll(true);
            }, 200);

        } else {
            alert("Contact is not your friend!");
        };

    }

    checkMsgWithoutRead(id_contact_g: number, contact_type: number): number {
        let msgNotRead: number = 0;

        this.CHATS.some((chat) => {
            if (chat.subject.id_subject == id_contact_g && chat.type == contact_type) {

                return chat.messages.some((message) => {
                    message.read == false ? msgNotRead++ : true;
                });

            };
        });

        return msgNotRead;
    }

    getLatestMessage(id_contact_g: number, contact_type: number): string {
        const findMessages: IChats = this.CHATS.find((chat) => chat.subject.id_subject == id_contact_g && chat.type == contact_type);

        return this.CHATS.includes(findMessages) ?
            findMessages.messages[findMessages.messages.length - 1].text.length >= 16
                ?
                findMessages.messages[findMessages.messages.length - 1].text.slice(0, 15) + '...' :
                findMessages.messages[findMessages.messages.length - 1].text
            :
            null;
    }

    getMessages(): IMessagesList[] {

        const findMessages: IChats = this.CHATS.find((chat) => chat.subject.id_subject == this.infoSentMessage.subject.id_subject && chat.type == this.infoSentMessage.typeMessage);

        if (findMessages == undefined) {
            const messages: IChats = {
                messages: [],
                subject: {
                    id_subject: this.infoSentMessage.subject.id_subject,
                    name: this.infoSentMessage.subject.name,
                    photo: this.infoSentMessage.subject.photo,
                    online: false
                },
                type: this.infoSentMessage.typeMessage
            };

            return messages.messages;
        } else {
            return findMessages.messages;
        };
    }

    cleanChat(id_subject: number, type: number): void {
        let position: number = 0;

        this.CHATS.some((chat) => {
            if (chat.subject.id_subject == id_subject && chat.type == type) return this.CHATS.splice(position, 1);

            position++;
        });
    }

    reconectServer(): void {
        if (!this.socketWebSvc.statusConnection) {
            this.socketWebSvc.connectServerSocket(localStorage.getItem('token'));
            this.getContacts();
        }
    }

    // Contacts

    getContacts(): void {
        // reset contacts list
        this.CONTACTS = [];

        this.loadingGettingContacts = true;

        this._client.getRequest(`${this._server}/user/manage/contactsg`, localStorage.getItem('token')).subscribe(
            (res: IResponseGetContactsG) => {
                // verify auth
                res.auth_token == false ? this._auth.logout() : true;

                this.loadingGettingContacts = false;

                // saving contacts to list
                res.contacts.forEach((contact) => {
                    this.CONTACTS.push({
                        type: contact.type,
                        id_contact_g: contact.id,
                        name: contact.name,
                        photo: contact.photo
                    });
                });

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

                                    this.socketWebSvc.emit('join-group', {
                                        data: {
                                            token
                                        }
                                    });
                                },
                                (error) => {
                                    console.log("****ERROR****");
                                    console.log(error);

                                    this.loadingGettingContacts = true;

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
                    }
                });

            },
            (error) => {
                console.log("***ERROR***");
                console.log(error);

                this.loadingGettingContacts = false;
            }
        );
    }

    AddContacts(): void {
        // hide chat view and show contacts add view
        let styleInit: Promise<boolean> = this.initStyleEffect();
        styleInit.then((res) => {
            this.isChatting = false;

            this.isAddingContacts = true;

            // set focus input search
            setTimeout(() => {
                try {
                    this.InputSearch.nativeElement.focus();
                } catch (e) {
                }
            }, 500);
        });

    }

    searchingContacts(search_key: string): void {
        const token: string = localStorage.getItem('token');

        const data: SearchContactsData = {
            search_key: search_key.trim()
        };

        if (data.search_key == "") {
            this.resultSearchContacts = null;
            return
        };

        this.loadingSearchingContacts = true;

        this.subSearchContacts$ ? this.subSearchContacts$.unsubscribe() : true;

        this.subSearchContacts$ = this._client.postRequest(`${this._server}/user/search/contacts`, data, token).subscribe(
            (response: SearchContactsResponse) => {
                response.auth_token == false ? this._auth.logout() : true;

                this.loadingSearchingContacts = false;

                this.resultSearchContacts = response;

            },
            (error) => {
                console.log("***ERROR***");

                console.log(error);

                this.loadingSearchingContacts = false;

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

    }

    areFriendsDraw(friend: number): boolean {
        const findFriend = this.CONTACTS.find((contact) => contact.id_contact_g == friend && contact.type == 1);

        return findFriend !== undefined ? true : false;
    }

    AddActionContacts(contact: number): void {
        const data: AddContactsRequest = {
            token: localStorage.getItem('token'),
            user_add: contact
        };

        this.loadingSearchingContacts = true;

        this._client.postRequest(`${this._server}/user/manage/contactsg`, data, localStorage.getItem('token')).subscribe(
            (response: AddContactsResponse) => {
                // check auth
                response.auth_token == false ? this._auth.logout() : true;

                this.loadingSearchingContacts = false;

                // verify sent
                if (response.send) {
                    const Notify = new Promise((resolve) => {
                        notie.alert({
                            type: 'info',
                            text: "Solicitud de amistad enviada!",
                            stay: false,
                            time: 3,
                            position: "top"
                        });
                        setTimeout(function () {
                            resolve(true);
                        }, 3000);
                    })
                    Notify.then((e) => {
                        console.error("QUERY FRIENDS SUCCESS");
                    });
                } else {
                    if (response.reason == 1) {
                        const Notify = new Promise((resolve) => {
                            notie.alert({
                                type: 'info',
                                text: "Ya son amigos!",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 3000);
                        })
                        Notify.then((e) => {
                            console.error("QUERY FRIENDS CANCEL");
                            this.getContacts();
                        });
                    } else if (response.reason == 2) {
                        const Notify = new Promise((resolve) => {
                            notie.alert({
                                type: 'error',
                                text: "No puedes enviarte solicitud a ti mismo!",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 3000);
                        })
                        Notify.then((e) => {
                            console.error("QUERY FRIENDS ERROR");
                        });
                    }
                }

            },
            (error) => {
                console.log("***ERROR**");
                console.log(error);

                this.loadingSearchingContacts = false;

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
    }

    deleteContact(contact: number, type: number): void {
        Swal.fire({
            title: '¿Está seguro de borrar el contacto?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `Si, borrar`,
            denyButtonText: `Cancelar`,
        }).then((result) => {

            if (result.isConfirmed) {
                // set payload for send request
                const payload: string = `${contact},${type}`

                this.loadingGettingContacts = true;

                this._client.deleteRequest(`${this._server}/user/manage/contactsg`, payload, localStorage.getItem('token')).subscribe(
                    (response: DeleteContactsResponse) => {
                        // verify auth
                        response.auth_token === false ? this._auth.logout() : true;

                        this.loadingGettingContacts = false;

                        if (response.deleted) {
                            const Notify = new Promise((resolve) => {
                                notie.alert({
                                    type: 'success',
                                    text: "Contacto eliminado con éxito!",
                                    stay: false,
                                    time: 2,
                                    position: "top"
                                });
                                setTimeout(function () {
                                    resolve(true);
                                }, 2000);
                            });
                            Notify.then((e) => {
                                console.log("CONTACT DELETED SUCCESS");

                                const isDeletedView: boolean = this.infoSentMessage.typeMessage == 1 ?
                                    this.infoSentMessage.subject.id_subject == contact && this.infoSentMessage.typeMessage == type ? true : false :
                                    this.infoSentMessage.subject.id_subject == contact && this.infoSentMessage.typeMessage == type ? true : false;

                                this.isChatting = !isDeletedView;
                            });
                        } else {
                            if (response.reason == 1) {
                                const Notify = new Promise((resolve) => {
                                    notie.alert({
                                        type: 'info',
                                        text: "El contacto pertenece a uno de tus grupos, primero quítalo!",
                                        stay: false,
                                        time: 4,
                                        position: "top"
                                    });
                                    setTimeout(function () {
                                        resolve(true);
                                    }, 4000);
                                });
                                Notify.then((e) => {
                                    console.error("DELETED CONTACT FAILED BECAUSE CONTACT IS JOINED A GROUP");
                                });
                            } else if (response.reason == 2) {
                                const Notify = new Promise((resolve) => {
                                    notie.alert({
                                        type: 'error',
                                        text: "Falló al eliminar el contacto, contacte soporte!",
                                        stay: false,
                                        time: 3,
                                        position: "top"
                                    });
                                    setTimeout(function () {
                                        resolve(true);
                                    }, 3000);
                                })
                                Notify.then((e) => {
                                    console.error("DELETED CONTACT ERROR");
                                });
                            } else {
                                const Notify = new Promise((resolve) => {
                                    notie.alert({
                                        type: 'error',
                                        text: "Error desconocido, contacte soporte!",
                                        stay: false,
                                        time: 3,
                                        position: "top"
                                    });
                                    setTimeout(function () {
                                        resolve(true);
                                    }, 3000);
                                })
                                Notify.then((e) => {
                                    console.error("UNKNOW ERROR FOR DELETED CONTACT");
                                });
                            }
                        }

                        // reset list contacts
                        this.CONTACTS = [];

                        // get new list contacts
                        this.getContacts();

                    },
                    (error) => {
                        console.log("***ERROR***");
                        console.log(error);
                        this.loadingGettingContacts = false;
                    }
                );
            };
        });

    }

    filterContacts(data: string): void {
        const filter: string = data.trim();

        // Backup
        if (this.BK_CONTACTS.length == 0 && filter.length >= 1) {
            this.BK_CONTACTS = this.CONTACTS;

            // Reset contacts
            this.CONTACTS = [];
        };

        // Restore
        if (this.BK_CONTACTS.length >= 1 && filter.length == 0) {
            this.CONTACTS = this.BK_CONTACTS;

            // Reset backup
            this.BK_CONTACTS = [];
        };

        if (this.BK_CONTACTS.length >= 1 && filter.length >= 1) {
            // clean list contacts
            this.CONTACTS = [];

            this.BK_CONTACTS.some((contact) => {
                if (contact.name.toLowerCase().includes(filter.toLowerCase())) this.CONTACTS.push(contact);
            });
        }

        console.log("results", this.CONTACTS);

    }

}
