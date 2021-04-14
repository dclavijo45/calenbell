import { Component, OnInit } from '@angular/core';
import { EventsRequest } from 'src/app/interfaces/events-request';
import { ClientService } from 'src/app/services/client.service';
import { CreateCalendarService } from 'src/app/services/create-calendar.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    constructor(private _client: ClientService,
        private createCalendarService: CreateCalendarService) { }

    public _server: string = this._client._server;
    private token: string = localStorage.getItem('token');
    public eventsRequest: EventsRequest[] = []
    public loading: boolean = true;

    ngOnInit(): void {
        this._client.getRequest(`${this._server}/user/manage/events`, this.token).subscribe(
            (res: any) => {
                this.loading = false;
                this.eventsRequest = res.events;
                this.createCalendarService.dateEvents = {
                    day: [],
                    month: [],
                    year: [],
                    type: [],
                    status: [],
                    description: [],
                    title: [],
                    time: []
                }

                for (let i = 0; i < this.eventsRequest.length; i++) {
                    this.createCalendarService.dateEvents.day.push(this.eventsRequest[i].day)
                    this.createCalendarService.dateEvents.month.push((this.eventsRequest[i].month - 1) == 0 ? 12 : this.eventsRequest[i].month - 1)
                    this.createCalendarService.dateEvents.year.push(this.eventsRequest[i].year)
                    this.createCalendarService.dateEvents.description.push(this.eventsRequest[i].description)
                    this.createCalendarService.dateEvents.status.push(1)
                    this.createCalendarService.dateEvents.type.push(parseInt(this.eventsRequest[i].type_ev))
                    this.createCalendarService.dateEvents.title.push(this.eventsRequest[i].title)
                    this.createCalendarService.dateEvents.time.push(this.eventsRequest[i].hour)

                }
                this.createCalendarService.change();
            },
            (err) => {
                console.log(err);

            }
        )
    }

}
