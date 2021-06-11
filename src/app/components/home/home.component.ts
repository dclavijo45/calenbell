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
import { LeftEventResponse } from 'src/app/interfaces/left-event-response';
import { Subscription } from 'rxjs';
import { ThemeColorService } from 'src/app/services/theme-color.service';

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
        private _rootStatusPage: RootPageStatusService,
        public TC: ThemeColorService) { }

    public _server: string = this._client._server;
    private subLeftToEvent$: Subscription;
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

                if (this.eventsRequest.length > 0) {

                    // set aside info current event
                    this.infoCurrentEventService.infoEvent.title = this.eventsRequest[0].title
                    this.infoCurrentEventService.infoEvent.hour = this.eventsRequest[0].hour;
                    this.infoCurrentEventService.infoEvent.date.day = this.eventsRequest[0].day;
                    this.infoCurrentEventService.infoEvent.date.month = this.eventsRequest[0].month;
                    this.infoCurrentEventService.infoEvent.date.year = this.eventsRequest[0].year;
                    this.infoCurrentEventService.infoEvent.description = this.eventsRequest[0].description;
                    this.infoCurrentEventService.infoEvent.id = this.eventsRequest[0].id;
                    this.infoCurrentEventService.infoEvent.icon = this.eventsRequest[0].icon;
                    this.infoCurrentEventService.infoEvent.typeEvent = this.eventsRequest[0].type_ev;

                    // get participants of current event
                    this.infoCurrentEventService.getParticipants();
                };

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

        // reset info current event
        this.infoCurrentEventService.infoEvent = {
            title: null,
            id: null,
            hour: null,
            date: {
                day: null,
                month: null,
                year: null
            },
            description: null,
            icon: null,
            typeEvent: null,
            participants: [],
            owner: false
        };
    }

    checkBoxClick(idEvent: number): void {
        if (!this.eventsSelected.includes(idEvent)) {
            this.eventsSelected.push(idEvent);

            this.getEventsOwner().some((data) => {
                if (data.id.toString().includes(idEvent.toString())) {
                    const index = this.eventsRequest.indexOf(data);

                    if (this.eventsRequest[index].owner) {
                        this.eventsSelected.length == this.eventsRequest.filter(item => item.owner).length ? this.checkBoxSelectAll = true : this.checkBoxSelectAll = false;

                        return (this.eventsRequest[index].check = true);
                    };

                }
            });

        } else {
            this.eventsSelected = this.eventsSelected.filter(
                (e) => e !== idEvent
            );

            this.eventsRequest.some((data) => {
                if (data.id.toString().includes(idEvent.toString())) {
                    const index = this.eventsRequest.indexOf(data);

                    if (this.eventsRequest[index].owner) {
                        this.eventsSelected.length == this.eventsRequest.filter(item => item.owner).length ? this.checkBoxSelectAll = true : this.checkBoxSelectAll = false;

                        return (this.eventsRequest[index].check = false);
                    };

                }
            });
        }
    }

    getEventsOwner(): EventsRequest[] {
        return this.eventsRequest.filter(item => item.owner);
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
        this.getEventsOwner().some((data: EventsRequest) => {

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
                    let find: EventsRequest;

                    let data: string = this.eventsSelected.reduce((acc: number[], item) => {
                        find = this.eventsRequest.find((event) => event.owner && event.id == item);

                        find ? acc.push(find.id) : true;

                        return acc;

                    }, []).toString()


                    this.loading = true;

                    this._client.deleteRequest(`${this._server}/user/manage/events`, data, this._token).subscribe(
                        (res: EventsDeleteResponse) => {
                            this.loading = false;

                            if (!res.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            if (res.deleted) {
                                this.eventsSelected = [];

                                notie.alert({
                                    type: 'success',
                                    text: "Borrado correctamente",
                                    stay: false,
                                    time: 2,
                                    position: "top"
                                });

                                this.infoCurrentEventService.resetCurrentInfo();

                                this.createCalendarService.EventsAPIUpdated();

                            };

                            if (!res.deleted) {
                                const reasons = {
                                    1: () => {
                                        notie.alert({
                                            type: 'info',
                                            text: "Hay otras personas vinculadas en el evento, primero debes quitarlas",
                                            stay: false,
                                            time: 2,
                                            position: "top"
                                        });
                                    }
                                };

                                const showReason = reasons[res.reason] ? reasons[res.reason] : () => {
                                    notie.alert({
                                        type: 'error',
                                        text: "Hubo un problema interno, por favor contacta soporte",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                };

                                showReason();

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
                };

            });

        }
    }

    checkBoxSelectAllClick(): void {
        if (this.eventsSelected.length == this.getEventsOwner().length) {
            this.checkBoxSelectAll = false;

            this.eventsSelected = [];

            for (let i = 0; i < this.getEventsOwner().length; i++) {
                this.eventsRequest[i].check = false;
            };

        } else if (this.eventsSelected.length == 0) {
            this.checkBoxSelectAll = true;

            for (let i = 0; i < this.getEventsOwner().length; i++) {
                this.eventsRequest[i].check = true;

                this.eventsSelected.push(this.eventsRequest[i].id);
            };
        };

    }

    selectAllCheckboxes(): void {
        if (this.eventsSelected.length != this.getEventsOwner().length) {
            this.checkBoxSelectAll = true;
            this.eventsSelected = [];

            for (let i = 0; i < this.getEventsOwner().length; i++) {
                if (this.eventsRequest[i].owner) {
                    this.eventsRequest[i].check = true;

                    this.eventsSelected.push(this.eventsRequest[i].id);
                }

            }

            console.log(this.eventsSelected);

        }

    }

    viewInfoProduct(id: number) {
        if (this.infoCurrentEventService.infoEvent.id != id) {
            this.eventsRequest.some((data) => {
                if (data.id.toString().includes(id.toString())) {
                    this.infoCurrentEventService.infoEvent.title = data.title
                    this.infoCurrentEventService.infoEvent.hour = data.hour;
                    this.infoCurrentEventService.infoEvent.date.day = data.day;
                    this.infoCurrentEventService.infoEvent.date.month = data.month;
                    this.infoCurrentEventService.infoEvent.date.year = data.year;
                    this.infoCurrentEventService.infoEvent.description = data.description;
                    this.infoCurrentEventService.infoEvent.id = data.id;
                    this.infoCurrentEventService.infoEvent.icon = data.icon;
                    this.infoCurrentEventService.infoEvent.typeEvent = data.type_ev;

                    return (this.infoCurrentEventService.getParticipants())
                }
            });
        }
    }

    leftToEvent(id_event: number): void {
        Swal.fire({
            title: '¿Está seguro de salir del evento?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
        }).then((result) => {

            if (result.isConfirmed) {
                this.subLeftToEvent$ ? this.subLeftToEvent$.unsubscribe() : true;

                this.subLeftToEvent$ = this._client.deleteRequest(`${this._server}/user/participantsevent/${id_event}/`, "", localStorage.getItem('token')).subscribe(
                    (response: LeftEventResponse) => {
                        if (!response.auth_token) {
                            this._auth.logout();
                            return;
                        };

                        if (response.left) {
                            notie.alert({
                                type: 'success',
                                text: "Has salido correctamente del evento",
                                stay: false,
                                time: 3,
                                position: "top"
                            });

                        };

                        if (!response.left) {
                            const reasons = {
                                1: () => {
                                    notie.alert({
                                        type: 'error',
                                        text: "Evento no válido",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                2: () => {
                                    notie.alert({
                                        type: 'info',
                                        text: "El evento no existe",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                3: () => {
                                    notie.alert({
                                        type: 'error',
                                        text: "El evento no es de tipo grupo",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                4: () => {
                                    notie.alert({
                                        type: 'info',
                                        text: "No haces parte del evento",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                }
                            };

                            const showNotificationError = reasons[response.reason] ? reasons[response.reason] : () => {
                                notie.alert({
                                    type: 'error',
                                    text: "Ha ocurrido un problema, contacta soporte",
                                    stay: false,
                                    time: 2,
                                    position: "top"
                                });
                            };

                            showNotificationError();
                        };

                        this.createCalendarService.EventsAPIUpdated();
                    },
                    (error) => {
                        console.log("***ERROR***");
                        console.error(error);

                    }
                );
            };
        });

    }

}
