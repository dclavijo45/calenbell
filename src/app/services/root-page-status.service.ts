import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RootPageStatusService {

    constructor() { }

    private rootPageStatus: boolean = false;


    // Detect root page [home]

    public detectRootPage = new BehaviorSubject<boolean>(this.rootPageStatus);

    listenRootPageStatus(): Observable<boolean> {
        return this.detectRootPage.asObservable();
    }

    changeRootPageStatus(status: boolean): void {
        this.detectRootPage.next(status);
    }

    // Detect root page Number [home - tags]

    public detectRootPageNumber = new Subject<number>();

    listenRootPageNumberStatus(): Observable<number> {
        return this.detectRootPageNumber.asObservable();
    }

    changeRootPageNumberStatus(status: number): void {
        this.detectRootPageNumber.next(status);
    }
}
