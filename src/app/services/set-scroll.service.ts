import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SetScrollService {

    constructor() { }

    private detectSetScroll: Subject<boolean> = new Subject<boolean>();

    public listenerSetScroll(): Observable<boolean> {
        return this.detectSetScroll.asObservable();
    }

    public setScroll(set: boolean): void {
        this.detectSetScroll.next(set)
    }
}
