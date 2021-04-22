import { Component, OnInit } from '@angular/core';
import { EventsRequest } from 'src/app/interfaces/events-request';
import { ClientService } from 'src/app/services/client.service';
import { CreateCalendarService } from 'src/app/services/create-calendar.service';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import { InfoCurrentEventService } from 'src/app/services/info-current-event.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    constructor(private _client: ClientService,
        private createCalendarService: CreateCalendarService,
        private infoCurrentEventService: InfoCurrentEventService) { }

    public _server: string = this._client._server;
    public eventsRequest: EventsRequest[] = [];
    public loading: boolean = true;
    public lazyLoadCharge: number = this.infoCurrentEventService.lazyLoadCharge;

    ngOnInit(): void {
        this.createCalendarService.listenerDetectLoadingChange().subscribe(
            (status: boolean) => {
                this.loading = status;
            }
        );

        this.createCalendarService.listenerEventsRequestChange().subscribe(
            (request: EventsRequest[]) => {
                this.eventsRequest = request;
            }
        );

        this.infoCurrentEventService.listenerLazyLoadChange().subscribe(
            (lazyLoadCharge: number) => {
                this.lazyLoadCharge = lazyLoadCharge;
            }
        );
    }

}
