import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventsRequest } from '../interfaces/events-request';

@Injectable({
    providedIn: 'root'
})
export class ControlEventsService {

    constructor() { }

    public actionEvent: string = null;

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

    detectActionEventChange = new BehaviorSubject<string>(this.actionEvent);

    listenerActionEventChange(): Observable<string> {
        return this.detectActionEventChange.asObservable();
    }

    actionChangedNow(): void {
        this.detectActionEventChange.next(this.actionEvent);
    }
}
