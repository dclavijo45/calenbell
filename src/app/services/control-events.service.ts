import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { EventsRequest } from '../interfaces/events-request';
import { ClientService } from './client.service';
import { CreateCalendarService } from './create-calendar.service';
import { TokenAuthStateService } from './token-auth-state.service';

@Injectable({
    providedIn: 'root'
})
export class ControlEventsService {

    constructor(private createCalendarService: CreateCalendarService,
        private _client: ClientService,
        private _auth: TokenAuthStateService) { }



    public controlEventData: EventsRequest = {
        id: null,
        title: null,
        day: null,
        month: null,
        year: null,
        hour: null,
        description: null,
        type_ev: null,
        icon: null,
        check: null
    }

    resetControlEventData(): void {
        this.controlEventData = {
            id: null,
            title: null,
            day: null,
            month: null,
            year: null,
            hour: null,
            description: null,
            type_ev: null,
            icon: null,
            check: null
        }
    }

    // Detect action event change

    public detectActionEventChange = new BehaviorSubject<string>(null);

    listenerActionEventChange(): Observable<string> {
        return this.detectActionEventChange.asObservable();
    }

    actionChangedNow(action: string): void {
        this.detectActionEventChange.next(action);
    }

}
