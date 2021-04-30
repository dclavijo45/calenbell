import { Component, OnInit } from '@angular/core';
import { EventsRequest } from 'src/app/interfaces/events-request';
import { ClientService } from 'src/app/services/client.service';
import { CreateCalendarService } from 'src/app/services/create-calendar.service';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import { InfoCurrentEventService } from 'src/app/services/info-current-event.service';
import { ControlEventsService } from 'src/app/services/control-events.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    constructor(private _client: ClientService,
        private createCalendarService: CreateCalendarService,
        private infoCurrentEventService: InfoCurrentEventService,
        private controlEventsService: ControlEventsService,
        private router: Router) { }

    public _server: string = this._client._server;
    public eventsRequest: EventsRequest[] = [];
    public loading: boolean = true;
    public eventsSelected: number[] = [];
    public lazyLoadCharge: number = this.infoCurrentEventService.lazyLoadCharge;
    public eventsFiltered: EventsRequest[] = [];
    public notFoundDataFiltered: boolean = null;
    public inputSearchValue: string = "";
    public checkBoxSelectAll: boolean = false;

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

    checkBoxClick(idEvent: number): void {
        if (!this.eventsSelected.includes(idEvent)) {
            this.eventsSelected.push(idEvent);

            this.eventsRequest.some((data) => {
                if (data.id.toString().includes(idEvent.toString())) {
                    const index = this.eventsRequest.indexOf(data);

                    this.eventsSelected.length == this.eventsRequest.length ? this.checkBoxSelectAll = true : this.checkBoxSelectAll = false;


                    return (this.eventsRequest[index].check = true);
                }
            });

        } else {
            this.eventsSelected = this.eventsSelected.filter(
                (e) => e !== idEvent
            );

            this.eventsRequest.some((data) => {
                if (data.id.toString().includes(idEvent.toString())) {
                    const index = this.eventsRequest.indexOf(data);

                    this.eventsSelected.length == this.eventsRequest.length ? this.checkBoxSelectAll = true : this.checkBoxSelectAll = false;

                    return (this.eventsRequest[index].check = false);
                }
            });
        }
    }

    searchEvents(dataToFilter: string): void {
        if (this.inputSearchValue.trim().length != 0) {
            this.eventsFiltered = [];
            this.eventsRequest.forEach((data) => {
                if (
                    data.day.toString().includes(dataToFilter) ||
                    data.hour.toString().includes(dataToFilter) ||
                    data.month.toString().includes(dataToFilter) ||
                    data.year.toString().includes(dataToFilter) ||
                    data.title.toString().includes(dataToFilter) ||
                    data.description.toString().includes(dataToFilter)
                ) {
                    this.eventsFiltered.push(data);
                }
            });
            this.eventsFiltered.length == 0
                ? (this.notFoundDataFiltered = true)
                : (this.notFoundDataFiltered = false);
        } else {
            this.notFoundDataFiltered = false;
        }

    }

    alert(): void {
        alert("click");
    }

    checkBoxSelectAllClick(): void {
        if (this.eventsSelected.length == this.eventsRequest.length) {
            this.checkBoxSelectAll = false;

            this.eventsSelected = [];

            for (let i = 0; i < this.eventsRequest.length; i++) {
                this.eventsRequest[i].check = false;
                // this.eventsSelected.push(this.eventsRequest[i].id);
            }
        } else if (this.eventsSelected.length == 0) {
            this.checkBoxSelectAll = true;

            for (let i = 0; i < this.eventsRequest.length; i++) {
                this.eventsRequest[i].check = true;

                this.eventsSelected.push(this.eventsRequest[i].id);
            }
        }

        console.log(this.eventsSelected);
    }

    selectAllCheckboxes(): void {
        if (this.eventsSelected.length != this.eventsRequest.length) {
            this.checkBoxSelectAll = true;
            this.eventsSelected = [];

            for (let i = 0; i < this.eventsRequest.length; i++) {
                this.eventsRequest[i].check = true;

                this.eventsSelected.push(this.eventsRequest[i].id);
            }

            console.log(this.eventsSelected);

        }

    }

    // clickToP(id) {
    //     //this.auth.validateJwt()
    //     this.listP.some((data) => {
    //         if (data.id.toString().includes(id)) {
    //             this.infoProduct.img_product = data.img_product;
    //             this.infoProduct.price_product = data.price_product;
    //             this.infoProduct.name_product = data.name_product;
    //             return (this.infoProduct.description_product =
    //                 data.description_product);
    //         }
    //     });
    // }   FOR USE IN INFO PRODUCTS

    editEvent() {
        this.eventsRequest.some((data: EventsRequest) => {

            if (data.id.toString().includes(this.eventsSelected[0].toString())) {
                this.controlEventsService.controlEventData = data;

                this.controlEventsService.actionEvent = 'edit';
                this.controlEventsService.actionChangedNow();

                return this.router.navigate(['/controlevento']);
            }
        });
    }
}
