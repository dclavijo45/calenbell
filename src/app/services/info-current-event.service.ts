import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { IContactsChat } from '../interfaces/i-contacts-chat';
import { InfoEventCurrent } from '../interfaces/info-event-current';
import { IParticipants, ParticipantsResponse } from '../interfaces/participants-response';
import { ClientService } from './client.service';
import { InfoProfileService } from './info-profile.service';
import { SocketWebService } from './socket-web.service';
import { TokenAuthStateService } from './token-auth-state.service';

@Injectable({
    providedIn: 'root'
})
export class InfoCurrentEventService {

    constructor(private infoProfileSvc: InfoProfileService,
        private _client: ClientService,
        private socketWebSvc: SocketWebService, private _auth: TokenAuthStateService) { }

    public infoEvent: InfoEventCurrent = {
        title: null,
        id: null,
        hour: null,
        date: {
            day: null,
            month: null,
            year: null
        },
        description: null,
        icon: null,
        typeEvent: null,
        participants: [],
        owner: false
    }

    private subscriptionGetParticipants$: Subscription;

    public lazyLoadCharge: number = 20;

    public loadingGetParticipants: boolean = false;

    // Detect assign event to show info
    assignEventInfoChange = new BehaviorSubject<number>(this.lazyLoadCharge);

    // Detect lazy load change
    lazyLoadChange = new BehaviorSubject<number>(this.lazyLoadCharge);

    listenerLazyLoadChange(): Observable<number> {
        return this.lazyLoadChange.asObservable();
    }

    lazyLoadChanged(): void {
        this.lazyLoadChange.next(this.lazyLoadCharge);
    }

    getParticipants(): void {
        // reset participants
        this.infoEvent.participants = [];

        // set event and typeEvent
        const event: number = this.infoEvent.id;
        const typeEvent: number = this.infoEvent.typeEvent;

        // verify event if is not individual
        if (typeEvent == 1) {
            // set owner event
            this.infoEvent.owner = true;

            this.infoEvent.participants.push({
                id: this.infoProfileSvc.info_profile.id,
                photo: this.infoProfileSvc.info_profile.photo,
                name: this.infoProfileSvc.info_profile.name,
                statusInvitation: 3
            });

            return;
        };

        this.loadingGetParticipants = true;

        // reset owner event
        this.infoEvent.owner = false;

        this.subscriptionGetParticipants$ ? this.subscriptionGetParticipants$.unsubscribe() : true;

        this.subscriptionGetParticipants$ = this._client.getRequest(`${this._client._server}/user/participantsevent/${event}/`, localStorage.getItem('token')).subscribe(
            (response: ParticipantsResponse) => {

                this.loadingGetParticipants = false;

                !response.auth_token ? this._auth.logout() : true;

                // set participants
                let userStatusFind: IContactsChat;

                response.participants.forEach(user => {

                    user.statusInvitation == 3 && user.id == this.infoProfileSvc.info_profile.id ? this.infoEvent.owner = true : true;

                    userStatusFind = this.socketWebSvc.CONTACTS.find((contact) => contact.id_contact_g == user.id && contact.type == 1);

                    if (!userStatusFind) {
                        this.infoEvent.participants.push({
                            id: user.id,
                            name: user.name,
                            photo: user.photo,
                            statusInvitation: user.statusInvitation
                        });
                    };

                });

                // set contacts - participants
                let participantFind: IParticipants;

                this.socketWebSvc.CONTACTS.forEach((contact) => {

                    participantFind = response.participants.find((user) => user.id == contact.id_contact_g && contact.type == 1);

                    if (participantFind) {
                        this.infoEvent.participants.push({
                            id: contact.id_contact_g,
                            name: contact.name,
                            photo: contact.photo,
                            statusInvitation: participantFind.statusInvitation
                        });
                    } else if (contact.type == 1) {
                        this.infoEvent.participants.push({
                            id: contact.id_contact_g,
                            name: contact.name,
                            photo: contact.photo,
                            statusInvitation: null
                        });
                    };
                });

            },
            (error) => {
                console.log("***ERROR***");
                console.log(error);

                this.loadingGetParticipants = false;
            }
        );
    }

    resetCurrentInfo(): void {
        this.infoEvent = {
            title: null,
            id: null,
            hour: null,
            date: {
                day: null,
                month: null,
                year: null
            },
            description: null,
            icon: null,
            typeEvent: null,
            participants: [],
            owner: false
        }
    }

}
