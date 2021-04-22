import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InfoCurrentEventService {

    constructor() { }

    public title: string = null;
    public hour: string = null;
    public data: string = null;
    public description: string = null;
    public typeEvent: string = null;

    public lazyLoadCharge: number = 20;

    // Detect lazy load change

    lazyLoadChange = new BehaviorSubject<number>(this.lazyLoadCharge);

    listenerLazyLoadChange(): Observable<number> {
        return this.lazyLoadChange.asObservable();
    }

    lazyLoadChanged(): void {
        this.lazyLoadChange.next(this.lazyLoadCharge);
    }

}
