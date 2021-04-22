import { Injectable } from '@angular/core';
import { DateEvents } from '../interfaces/date-events';
import { BehaviorSubject, Observable } from 'rxjs';
import { DateInfo } from '../interfaces/date-info';
import { EventsRequest } from '../interfaces/events-request';

@Injectable({
    providedIn: 'root'
})
export class CreateCalendarService {

    public dateEvents: DateEvents = {
        day: [],
        month: [],
        year: [],
        type: [],
        status: [],
        description: [],
        title: [],
        time: []
    }

    public eventsRequest: EventsRequest[] = [];

    public currentDateSelected: DateInfo = {
        day: null,
        month: null,
        year: null
    }

    public loadingHome: boolean = true;

    constructor() { }

    ngOnInit(): void {

    }

    // Detect date events change
    obs = new BehaviorSubject<DateEvents>(this.dateEvents);

    isChanged(): Observable<DateEvents> {
        return this.obs.asObservable();
    }

    change(): void {
        this.obs.next(this.dateEvents);
    }

    // Detect date change
    detectCurrentDateChange = new BehaviorSubject<DateInfo>(this.currentDateSelected);

    listenerDetectCurrentDateChange(): Observable<DateInfo> {
        return this.detectCurrentDateChange.asObservable();
    }

    currentDateHasChanged(): void {
        this.detectCurrentDateChange.next(this.currentDateSelected);
    }

    // Detect loading change
    detectLoadingChange = new BehaviorSubject<boolean>(this.loadingHome);

    listenerDetectLoadingChange(): Observable<boolean> {
        return this.detectLoadingChange.asObservable();
    }

    LoadingChanged(): void {
        this.detectLoadingChange.next(this.loadingHome);
    }

    // Detect events Request change

    detectEventsRequestChange = new BehaviorSubject<EventsRequest[]>(this.eventsRequest);

    listenerEventsRequestChange(): Observable<EventsRequest[]> {
        return this.detectEventsRequestChange.asObservable();
    }

    EventsRequestChanged(): void {
        this.detectEventsRequestChange.next(this.eventsRequest);
    }

    // Detect create a new event

    detectCreateNewEvent = new BehaviorSubject<boolean>(false);

    listenerdetectCreateNewEvent(): Observable<boolean> {
        return this.detectCreateNewEvent.asObservable();
    }

    createNewEventChanged(): void {
        this.loadingHome = true;
        this.LoadingChanged();
        this.detectCreateNewEvent.next(true);
    }
}
