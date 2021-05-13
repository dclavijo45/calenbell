import { Component, OnInit } from '@angular/core';
import { EventsDeleteResponse, EventsRequest } from 'src/app/interfaces/events-request';
import { ClientService } from 'src/app/services/client.service';
import { CreateCalendarService } from 'src/app/services/create-calendar.service';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import { InfoCurrentEventService } from 'src/app/services/info-current-event.service';
import { ControlEventsService } from 'src/app/services/control-events.service';
import { Router } from '@angular/router';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';
import notie from 'notie';
import Swal from 'sweetalert2/dist/sweetalert2.js';

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
        private _auth: TokenAuthStateService,
        private router: Router,
        private _rootStatusPage: RootPageStatusService) { }

    public _server: string = this._client._server;
    public eventsRequest: EventsRequest[] = [];
    public loading: boolean = true;
    public eventsSelected: number[] = [];
    public lazyLoadCharge: number = this.infoCurrentEventService.lazyLoadCharge;
    public eventsBackup: EventsRequest[] = [];
    public inputSearchValue: string = "";
    public checkBoxSelectAll: boolean = false;
    private _token: string = localStorage.getItem('token');

    ngOnInit(): void {
        // init tag state
        this._rootStatusPage.changeRootPageNumberStatus(5);

        this.createCalendarService.listenerDetectLoadingChange().subscribe(
            (status: boolean) => {
                this.loading = status;
            }
        );

        this.createCalendarService.listenerEventsRequestChange().subscribe(
            (request: EventsRequest[]) => {
                this.eventsRequest = request;
                console.log(request);

            }
        );

        this.infoCurrentEventService.listenerLazyLoadChange().subscribe(
            (lazyLoadCharge: number) => {
                this.lazyLoadCharge = lazyLoadCharge;
            }
        );
    }

    ngOnDestroy(): void {
        // kill status tag
        this._rootStatusPage.changeRootPageNumberStatus(null);
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

    searchEvents(dataSearch: string): void {
        // fix spaces
        let dataToFilter: string = dataSearch.trim();

        // backup
        if (this.eventsBackup.length == 0) this.eventsBackup = this.eventsRequest;

        // restore
        if (this.inputSearchValue.length == 0 && this.eventsBackup.length != 0) {
            this.eventsRequest = this.eventsBackup;
            this.eventsBackup = [];
            console.log("RESTORE");
            return;
        }

        this.eventsRequest = [];

        this.eventsBackup.forEach((data) => {

            if (dataToFilter[2] == "/") {
                let dateDetect: string = data.day.toString() + "/" + data.month.toString() + "/" + data.year.toString();

                dateDetect.includes(dataToFilter) ? this.eventsRequest.push(data) : false;

            } else {
                if (
                    data.day.toString().includes(dataToFilter.toLowerCase()) ||
                    data.hour.toString().includes(dataToFilter) ||
                    data.month.toString().includes(dataToFilter) ||
                    data.year.toString().includes(dataToFilter) ||
                    data.icon.toString().includes(dataToFilter) ||
                    data.title.toString().toLowerCase().includes(dataToFilter.toLowerCase()) ||
                    data.description.toString().toLowerCase().includes(dataToFilter.toLowerCase())
                ) {
                    this.eventsRequest.push(data);
                }
            }

        });

    }

    editEvent() {
        this.eventsRequest.some((data: EventsRequest) => {

            if (data.id.toString().includes(this.eventsSelected[0].toString())) {
                this.controlEventsService.controlEventData = data;

                this.controlEventsService.actionChangedNow('edit');

                return this.router.navigate(['/controlevento']);
            }
        });
    }

    deleteEvents(): void {
        if (this.eventsSelected.length > 0) {
            Swal.fire({
                title: '¿Está seguro de borrar lo seleccionado?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Sí, borrar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    let data: string = this.eventsSelected.toString();

                    this.loading = true;

                    this._client.deleteRequest(`${this._server}/user/manage/events`, data, this._token).subscribe(
                        (res: EventsDeleteResponse) => {
                            this.loading = false;
                            this.eventsSelected = [];

                            if (!res.auth_token) {
                                this._auth.logout();
                            };

                            if (res.deleted) {

                                let Notify = new Promise((resolve) => {
                                    notie.alert({
                                        type: 'success',
                                        text: "Borrado correctamente",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                    setTimeout(function () {
                                        resolve(true);
                                    }, 2000);
                                })
                                Notify.then((e) => {
                                    console.log("DELETE SUCCESS");
                                });

                                this.createCalendarService.EventsAPIUpdated();

                            } else {
                                let Notify = new Promise((resolve) => {
                                    notie.alert({
                                        type: 'error',
                                        text: "No se ha podido borrar",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                    setTimeout(function () {
                                        resolve(true);
                                    }, 2000);
                                })
                                Notify.then((e) => {
                                    console.error("DELETE FAILED");
                                });
                            }

                        },
                        (err: any) => {
                            this.loading = false;
                            console.error(err);
                            let Notify = new Promise((resolve) => {
                                notie.alert({
                                    type: 'error',
                                    text: "Revisa tu conexión a internet",
                                    stay: false,
                                    time: 2,
                                    position: "top"
                                });
                                setTimeout(function () {
                                    resolve(true);
                                }, 2000);
                            })
                            Notify.then((e) => {
                                console.error("Not internet");
                            });
                        }
                    );
                }
            })


        }
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

    viewInfoProduct(id) {
        this.eventsRequest.some((data) => {
            if (data.id.toString().includes(id)) {
                this.infoCurrentEventService.title;
                this.infoCurrentEventService.hour;
                this.infoCurrentEventService.data;
                this.infoCurrentEventService.description;
                return (this.infoCurrentEventService.typeEvent);
            }
        });
    }

}
