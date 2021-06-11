import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IChats, IMessagesList } from 'src/app/interfaces/i-chats';
import { IContactsChat } from 'src/app/interfaces/i-contacts-chat';
import { IInfoMyProfileChat } from 'src/app/interfaces/i-info-my-profile-chat';
import { IInfoSentMessage } from 'src/app/interfaces/i-info-sent-message';
import { IResponseGetContactsG } from 'src/app/interfaces/i-response-get-contactsg';
import { IResponseInitChat } from 'src/app/interfaces/i-response-init-chat';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ThemeColorService } from 'src/app/services/theme-color.service';

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
        private setScrollSvc: SetScrollService,
        public TC: ThemeColorService) { }

    private _server: string = this._client._server;

    // my profile
    public infoProfile: IInfoMyProfileChat = {
        name: 'Nombre ex 1',
        email: 'correox@domain.com',
        online: false,
        photo: 'https://image.shutterstock.com/image-vector/male-avatar-profile-picture-use-260nw-193292033.jpg',
        id: null
    };
    private info_profile_LC: LoginResponse = JSON.parse(localStorage.getItem('info_profile'));

    // chat
    public inputFieldMessage: string = '';
    public isChatting: boolean = false;
    public loadingGetTokenSocket: boolean = false;
    @ViewChild('input1') InputMessage: ElementRef;

    // fix vert options
    fixOptions = {
        infoProfile: {
            reconnect: false
        }
    }

    // contacts
    BK_CONTACTS: IContactsChat[] = [];
    isAddingContacts: boolean = false;
    loadingSearchingContacts: boolean = false;
    inputSearchContacts: string = '';
    inputFilterContacts: string = '';
    @ViewChild('input2') InputSearch: ElementRef;
    resultSearchContacts: SearchContactsResponse = null;
    private subSearchContacts$: Subscription;
    searchFieldCtrl: FormControl = new FormControl('', []);

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

    }

    ngAfterViewInit(): void {
        // init view style
        this.initStyleEffect();
    }

    ngOnDestroy(): void {
        // kill status tag
        this._rootStatusPage.changeRootPageNumberStatus(null);

        // reset info sent message
        this.socketWebSvc.infoSentMessage = {
            subject: {
                name: null,
                photo: null,
                online: null,
                id_subject: null
            },
            typeMessage: null,
            token: null
        };
    }

    // Fix options fun
    fixOptionsInfoProfile(vert): void {
        const status: boolean = this.fixOptions.infoProfile.reconnect;

        if (!status) {
            this.fixOptions.infoProfile.reconnect = true;

            vert.click();
        };

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

        const infoSentMessage: IInfoSentMessage = this.socketWebSvc.infoSentMessage;

        // Validate if not in current view chat
        if (id_contact_g == infoSentMessage.subject.id_subject && contact_type == infoSentMessage.typeMessage) {
            return;
        };

        // set style
        let styleInit: Promise<boolean> = this.initStyleEffect();
        styleInit.then((res) => {
            this.isChatting = true;
            this.isAddingContacts = false;

            // set info contact message
            const findContact: IContactsChat = this.socketWebSvc.CONTACTS.find((contact) => contact.id_contact_g == id_contact_g && contact.type == contact_type);

            if (this.socketWebSvc.CONTACTS.includes(findContact)) {

                // set info contact to sent messages
                infoSentMessage.subject.id_subject = id_contact_g;
                infoSentMessage.subject.name = findContact.name;
                infoSentMessage.subject.photo = findContact.photo;
                infoSentMessage.subject.online = false;
                infoSentMessage.typeMessage = findContact.type;

                // get auth for socket
                this._client.postRequest(`${this._server}/user/init/chat`, {
                    chat_type: findContact.type,
                    receiver: findContact.id_contact_g,
                    group: findContact.id_contact_g
                },
                    localStorage.getItem('token')).subscribe(
                        (res: IResponseInitChat) => {

                            if (!res.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            infoSentMessage.token = res.token;
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

            // check messages as read and update localstorage (only chat view --> subject)
            const CHATS: IChats[] = this.socketWebSvc.CHATS;

            const findChat: IChats = CHATS.find((chat) => chat.subject.id_subject == id_contact_g && chat.type == contact_type);

            if (CHATS.includes(findChat)) {

                // Set messages of user as read
                const findMessages: IMessagesList[] = CHATS[CHATS.indexOf(findChat)].messages;

                findMessages.map((chat) => chat.read = true);

                // check messages withour read
                this.socketWebSvc.checkMessagesWithoutRead();

                // update localstorage
                localStorage.setItem('chats', JSON.stringify(CHATS))

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

        });

    }

    sendMessage(): void {
        if (this.inputFieldMessage.trim().length == 0) {
            return;
        };

        const infoSentMessage: IInfoSentMessage = this.socketWebSvc.infoSentMessage;

        const data: ISocketSentMessage = infoSentMessage.typeMessage == 1 ? {
            message: this.inputFieldMessage,
            token: infoSentMessage.token
        } : {
            message: this.inputFieldMessage,
            token: infoSentMessage.token,
            info_profile_group: {
                photo: this.infoProfile.photo,
                online: false,
                name: this.infoProfile.name
            }
        };

        if (data.token != null) {

            // Validate if not exist chat
            const CHATS: IChats[] = this.socketWebSvc.CHATS;

            const findChat: IChats = CHATS.find((chat) => chat.subject.id_subject == infoSentMessage.subject.id_subject && chat.type == infoSentMessage.typeMessage);

            if (CHATS.includes(findChat)) {

                CHATS[CHATS.indexOf(findChat)].messages.push({
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

                // update localstorage
                localStorage.setItem('chats', JSON.stringify(CHATS));
            } else {
                CHATS.push({
                    type: infoSentMessage.typeMessage,
                    subject: {
                        photo: infoSentMessage.subject.photo,
                        name: infoSentMessage.subject.name,
                        id_subject: infoSentMessage.subject.id_subject,
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

                // update localstorage
                localStorage.setItem('chats', JSON.stringify(CHATS));
            };

            // Send message to group or user
            infoSentMessage.typeMessage == 1 ? this.socketWebSvc.emit('message-one-one', { data }) : this.socketWebSvc.emit('message-group', { data })


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

        this.socketWebSvc.CHATS.forEach((chat) => chat.subject.id_subject == id_contact_g && chat.type == contact_type ? chat.messages.forEach((msg) => !msg.read ? msgNotRead++ : true) : true);

        return msgNotRead;
    }

    getLatestMessage(id_contact_g: number, contact_type: number): string {
        const findMessages: IChats = this.socketWebSvc.CHATS
            .find((chat) => chat.subject.id_subject == id_contact_g && chat.type == contact_type);

        const messages: IMessagesList[] = findMessages ? findMessages.messages : null;

        if (this.socketWebSvc.CHATS.includes(findMessages)) {
            if (messages[messages.length - 1].text.length >= 16) {
                return messages[messages.length - 1]
                    .text.slice(0, 15) + '...';

            } else return messages[messages.length - 1].text;

        } else return null;
    }

    getMessages(): IMessagesList[] {
        const findMessages: IChats = this.socketWebSvc.CHATS.find((chat) => chat.subject.id_subject == this.socketWebSvc.infoSentMessage.subject.id_subject && chat.type == this.socketWebSvc.infoSentMessage.typeMessage);

        if (findMessages == undefined) {
            const messages: IChats = {
                messages: [],
                subject: {
                    id_subject: this.socketWebSvc.infoSentMessage.subject.id_subject,
                    name: this.socketWebSvc.infoSentMessage.subject.name,
                    photo: this.socketWebSvc.infoSentMessage.subject.photo,
                    online: false
                },
                type: this.socketWebSvc.infoSentMessage.typeMessage
            };

            return messages.messages;
        } else {
            return findMessages.messages;
        };
    }

    cleanChat(id_subject: number, type: number): void {
        let position: number = 0;

        this.socketWebSvc.CHATS.some((chat) => {
            if (chat.subject.id_subject == id_subject && chat.type == type) {

                this.socketWebSvc.CHATS.splice(position, 1);

                // update localstorage
                return localStorage.setItem('chats', JSON.stringify(this.socketWebSvc.CHATS));
            };

            position++;
        });

    }

    reconectServer(): void {
        if (!this.socketWebSvc.statusConnection) {
            this.socketWebSvc.disconnectServerSocket();

            this.socketWebSvc.connectServerSocket(localStorage.getItem('token'));

            this.getContacts();
        }
    }

    // Contacts

    getContacts(): void {
        // reset contacts list
        this.socketWebSvc.CONTACTS = [];

        this.socketWebSvc.loadingGettingContacts = true;

        this._client.getRequest(`${this._server}/user/manage/contactsg`, localStorage.getItem('token')).subscribe(
            (res: IResponseGetContactsG) => {
                // verify auth
                if (!res.auth_token) {
                    this._auth.logout();
                    return;
                };

                this.socketWebSvc.loadingGettingContacts = false;

                // saving contacts to list
                res.contacts.forEach((contact) => {
                    this.socketWebSvc.CONTACTS.push({
                        type: contact.type,
                        id_contact_g: contact.id,
                        name: contact.name,
                        photo: contact.photo
                    });
                });

                // joining to group to socket server
                this.socketWebSvc.CONTACTS.forEach((contact) => {
                    if (contact.type == 2) {
                        this._client.postRequest(`${this._server}/user/init/chat`, {
                            chat_type: contact.type,
                            receiver: contact.id_contact_g,
                            group: contact.id_contact_g
                        },
                            localStorage.getItem('token')).subscribe(
                                (res: IResponseInitChat) => {

                                    if (!res.auth_token) {
                                        this._auth.logout();
                                        return;
                                    };

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

                                    this.socketWebSvc.loadingGettingContacts = true;

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
                                    });
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

                this.socketWebSvc.loadingGettingContacts = false;
            }
        );
    }

    AddContacts(): void {
        // hide chat view and show contacts add view and reset viewchat contactg
        let styleInit: Promise<boolean> = this.initStyleEffect();
        styleInit.then((res) => {
            this.isChatting = false;

            this.isAddingContacts = true;

            // reset viewchat contactg
            this.socketWebSvc.infoSentMessage = {
                subject: {
                    name: null,
                    photo: null,
                    online: null,
                    id_subject: null
                },
                typeMessage: null,
                token: null
            };

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

        this.subSearchContacts$ = this._client.postRequest(`${this._server}/user/search/contacts`, data, token)
            .pipe(
                debounceTime(500)
            )
            .subscribe(
                (response: SearchContactsResponse) => {

                    if (!response.auth_token) {
                        this._auth.logout();
                        return;
                    };

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
                    });
                    Notify.then((e) => {
                        console.error("INTERNET ERROR");
                    });
                }
            );

    }

    areFriendsDraw(friend: number): boolean {
        const findFriend = this.socketWebSvc.CONTACTS.find((contact) => contact.id_contact_g == friend && contact.type == 1);

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
                if (!response.auth_token) {
                    this._auth.logout();
                    return;
                };

                this.loadingSearchingContacts = false;

                // verify sent
                if (response.send) {
                    notie.alert({
                        type: 'info',
                        text: "Solicitud de amistad enviada!",
                        stay: false,
                        time: 3,
                        position: "top"
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
                        notie.alert({
                            type: 'error',
                            text: "No puedes enviarte solicitud a ti mismo!",
                            stay: false,
                            time: 3,
                            position: "top"
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

                this.socketWebSvc.loadingGettingContacts = true;

                this._client.deleteRequest(`${this._server}/user/manage/contactsg`, payload, localStorage.getItem('token')).subscribe(
                    (response: DeleteContactsResponse) => {
                        // verify auth
                        response.auth_token === false ? this._auth.logout() : true;

                        this.socketWebSvc.loadingGettingContacts = false;

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

                                const isDeletedView: boolean = this.socketWebSvc.infoSentMessage.typeMessage == 1 ?
                                    this.socketWebSvc.infoSentMessage.subject.id_subject == contact && this.socketWebSvc.infoSentMessage.typeMessage == type ? true : false :
                                    this.socketWebSvc.infoSentMessage.subject.id_subject == contact && this.socketWebSvc.infoSentMessage.typeMessage == type ? true : false;

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
                        this.socketWebSvc.CONTACTS = [];

                        // get new list contacts
                        this.getContacts();

                    },
                    (error) => {
                        console.log("***ERROR***");
                        console.log(error);
                        this.socketWebSvc.loadingGettingContacts = false;
                    }
                );
            };
        });

    }

    filterContacts(data: string): void {
        const filter: string = data.trim();

        // Backup
        if (this.BK_CONTACTS.length == 0 && filter.length >= 1) {
            this.BK_CONTACTS = this.socketWebSvc.CONTACTS;

            // Reset contacts
            this.socketWebSvc.CONTACTS = [];
        };

        // Restore
        if (this.BK_CONTACTS.length >= 1 && filter.length == 0) {
            this.socketWebSvc.CONTACTS = this.BK_CONTACTS;

            // Reset backup
            this.BK_CONTACTS = [];
        };

        if (this.BK_CONTACTS.length >= 1 && filter.length >= 1) {

            // clean list contacts
            this.socketWebSvc.CONTACTS = [];

            this.BK_CONTACTS.some((contact) => {
                if (contact.name.toLowerCase().includes(filter.toLowerCase())) this.socketWebSvc.CONTACTS.push(contact);
            });
        };

    }

}
