import { Injectable } from '@angular/core';
import { DateEvents } from '../interfaces/date-events';
import { BehaviorSubject, Observable } from 'rxjs';

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

    constructor() { }

    ngOnInit(): void {

    }

    obs = new BehaviorSubject<DateEvents>(this.dateEvents);

    isChanged(): Observable<DateEvents> {
        return this.obs.asObservable();
    }

    change(): void {
        this.obs.next(this.dateEvents);
    }


}
