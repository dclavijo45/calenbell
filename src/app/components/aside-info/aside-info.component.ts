import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DateEvents } from 'src/app/interfaces/date-events';
import { EventsRequest } from 'src/app/interfaces/events-request';
import { ClientService } from 'src/app/services/client.service';
import { CreateCalendarService } from 'src/app/services/create-calendar.service';
import { InfoCurrentEventService } from 'src/app/services/info-current-event.service';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import notie from 'notie';
import { GetEventsRequest } from 'src/app/interfaces/get-events-request';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-aside-info',
    templateUrl: './aside-info.component.html',
    styleUrls: ['./aside-info.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsideInfoComponent implements OnInit {

    constructor(private createCalendarService: CreateCalendarService,
        private Router: Router,
        private _client: ClientService,
        private _auth: TokenAuthStateService,
        private infoCurrentEventService: InfoCurrentEventService, private cdr: ChangeDetectorRef) { }

    private _server: string = this._client._server;
    private _token: string = localStorage.getItem('token');
    private meses: string[] = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];
    private currentDate: Date = new Date(Date.now());
    private diaActual = this.currentDate.getDate();
    private numeroDeMes = this.currentDate.getMonth();
    private añoActual = this.currentDate.getFullYear();
    public _DIAHOY = new Date(Date.now()).getDate();
    public _MESHOY = new Date(Date.now()).getMonth();
    public _ANIOHOY = new Date(Date.now()).getFullYear();
    public daysMonth = {
        data: [],
        month: null,
        year: null
    }
    private dateEvents: DateEvents = this.createCalendarService.dateEvents;

    @ViewChild("dates") dates: ElementRef;
    @ViewChild("month") month: ElementRef;
    @ViewChild("year") year: ElementRef;
    @ViewChild("prev-month") prevMonthDOM: ElementRef;
    @ViewChild("next-month") nextMonthDOM: ElementRef;
    public eventsRequest: EventsRequest[] = [];
    public lazyLoadCharge: number = this.infoCurrentEventService.lazyLoadCharge;
    public loading: boolean = this.createCalendarService.loadingHome;

    ngOnInit(): void {

        this.getEvents();

        this.createCalendarService.isChanged().subscribe(
            (data: DateEvents) => {
                this.daysMonth = {
                    data: [],
                    month: null,
                    year: null
                }
                this.dateEvents = null;
                this.dateEvents = data;

                this.writeMonth(this.numeroDeMes);

            }
        );

        this.createCalendarService.listenerEventsRequestChange().subscribe(
            (request: EventsRequest[]) => {

                this.eventsRequest = [];

                if (request.length != 0) {
                    for (let i = 0; i < request.length; i++) {
                        if (request[i].day == this._DIAHOY && request[i].month == this._MESHOY + 1 && request[i].year == this._ANIOHOY) {
                            this.eventsRequest.push(request[i]);
                        };
                    };
                };

            }
        );

        this.infoCurrentEventService.listenerLazyLoadChange().subscribe(
            (lazyLoadCharge: number) => {
                this.lazyLoadCharge = lazyLoadCharge;
            }
        );

        this.createCalendarService.listenerDetectLoadingChange().subscribe(
            (loading: boolean) => {
                this.loading = loading;
            }
        );

        this.createCalendarService.listenerUpdateEventsAPI().subscribe(
            (res: boolean) => {
                res ? this.getEvents() : false;
            }
        );

    }

    prevMonth() {
        this.lastMonth()
    }

    writeMonth(month) {
        this.daysMonth.data = [];
        this.daysMonth.year = this.añoActual;
        this.daysMonth.month = this.meses[month];

        for (let i = this.diaInicial(); i > 0; i--) {
            this.daysMonth.data.push({
                day: this.obtenerTotalDeDias(this.numeroDeMes - 1) - (i - 1), event: false,
                isLast: true,
                today: false,
                numEv: 0
            })

        }

        for (let i = 1; i <= this.obtenerTotalDeDias(month); i++) {

            if (i === this._DIAHOY && month === this._MESHOY && this.daysMonth.year == this._ANIOHOY) { // para dia actual / mes = mes - 1
                this.daysMonth.data.push({
                    day: i,
                    event: false,
                    isLast: false,
                    today: true,
                    numEv: 0
                });

            } else if (this.dateEvents.day.includes(i <= 9 ? '0' + i.toString() : i.toString()) && (this.dateEvents.month).includes(month)) {
                // dias con eventos

                for (let k = 0; k < this.dateEvents.day.length; k++) {
                    if (this.dateEvents.day[k] == (i <= 9 ? '0' + i.toString() : i.toString()) && this.dateEvents.month[k] == month) {
                        let numEv = 0;

                        // Lectura de numero de eventos
                        for (let k = 0; k < this.dateEvents.day.length; k++) {
                            if (this.dateEvents.day[k] == (i <= 9 ? '0' + i.toString() : i.toString()) && this.dateEvents.month[k] == month) {
                                numEv++;
                            }
                        }
                        this.daysMonth.data.push({
                            day: i,
                            event: true,
                            isLast: false,
                            today: false,
                            numEv: numEv
                        })
                        break;
                    }
                };

            }
            else { // Para dias normales
                this.daysMonth.data.push({
                    day: i,
                    event: false,
                    isLast: false,
                    today: false,
                    numEv: 0
                })
            }

        }

    }

    nextMonthClick() {
        this.nextMonth()
    }

    alert() {
        console.log(this.createCalendarService.dateEvents);
    }

    obtenerTotalDeDias(month) {
        if (month === -1) month = 11;

        if (
            month == 0 ||
            month == 2 ||
            month == 4 ||
            month == 6 ||
            month == 7 ||
            month == 9 ||
            month == 11
        ) {
            return 31;
        } else if (month == 3 || month == 5 || month == 8 || month == 10) {
            return 30;
        } else {
            return this.isLeap() ? 29 : 28;
        }
    }

    isLeap() {
        return (
            (this.añoActual % 100 !== 0 && this.añoActual % 4 === 0) || this.añoActual % 400 === 0
        );
    }

    diaInicial() {
        let start = new Date(this.añoActual, this.numeroDeMes, 1);
        return start.getDay() - 1 === -1 ? 6 : start.getDay() - 1;
    }

    lastMonth() {
        if (this.numeroDeMes !== 0) {
            this.numeroDeMes--;
        } else {
            this.numeroDeMes = 11;
            this.añoActual--;
        }

        this.configurarFecha();
    }

    nextMonth() {
        if (this.numeroDeMes !== 11) {
            this.numeroDeMes++;
        } else {
            this.numeroDeMes = 0;
            this.añoActual++;
        };

        this.configurarFecha();
    }

    configurarFecha() {
        this.currentDate.setFullYear(this.añoActual, this.numeroDeMes, this.diaActual);

        this.writeMonth(this.numeroDeMes);
    }

    randomClasses() {
        let classes = [{ 'b-color-1': true }, { 'b-color-2': true }, { 'b-color-3': true }, { 'b-color-4': true }, { 'b-color-5': true }, { 'b-color-6': true }, { 'b-color-7': true }, { 'b-color-8': true }, { 'b-color-9': true }];

        return classes[Math.floor(Math.random() * classes.length)];
    }

    createEventSelectDate(day: number, month: string, year: number): void {
        this.createCalendarService.currentDateSelected.day = day;
        this.createCalendarService.currentDateSelected.month = month;
        this.createCalendarService.currentDateSelected.year = year;
        this.Router.navigate(['/controlevento']);
        this.createCalendarService.currentDateHasChanged();
    }

    convertTo12Hour(time): string {
        // Check correct time format and split into components
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) { // If time format correct
            time = time.slice(1);  // Remove full string match value
            time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        };

        return time.join(''); // return adjusted time or original string
    }

    getEvents(): void {
        this.createCalendarService.loadingHome = true;
        this.loading = true;
        this.createCalendarService.LoadingChanged();

        this._client.getRequest(`${this._server}/user/manage/events`, this._token).subscribe(
            (res: GetEventsRequest) => {

                this.createCalendarService.loadingHome = false;
                this.createCalendarService.LoadingChanged();

                if (res.auth_token) {
                    this.createCalendarService.eventsRequest = res.events;
                    this.createCalendarService.EventsRequestChanged();
                } else {
                    this.createCalendarService.eventsRequest = [];
                    this.createCalendarService.EventsRequestChanged();
                    this._auth.logout();
                    return;
                };

                this.createCalendarService.dateEvents = {
                    day: [],
                    month: [],
                    year: [],
                    type: [],
                    status: [],
                    description: [],
                    title: [],
                    time: [],
                    owner: []
                };

                for (let i = 0; i < this.createCalendarService.eventsRequest.length; i++) {
                    this.createCalendarService.dateEvents.day.push(this.createCalendarService.eventsRequest[i].day.toString());

                    this.createCalendarService.dateEvents.month.push((this.createCalendarService.eventsRequest[i].month - 1) == 0 ? 12 : this.createCalendarService.eventsRequest[i].month - 1);

                    this.createCalendarService.dateEvents.year.push(this.createCalendarService.eventsRequest[i].year);

                    this.createCalendarService.dateEvents.description.push(this.createCalendarService.eventsRequest[i].description);

                    this.createCalendarService.dateEvents.status.push(1);

                    this.createCalendarService.dateEvents.type.push(this.createCalendarService.eventsRequest[i].type_ev);

                    this.createCalendarService.dateEvents.title.push(this.createCalendarService.eventsRequest[i].title);

                    this.createCalendarService.dateEvents.time.push(this.createCalendarService.eventsRequest[i].hour);

                    this.createCalendarService.dateEvents.owner.push(this.createCalendarService.eventsRequest[i].owner);

                };

                this.createCalendarService.change();
                this.cdr.detectChanges();

            },
            (err) => {
                this.createCalendarService.loadingHome = false;
                this.createCalendarService.LoadingChanged();

                this.createCalendarService.EventsRequestChanged();

                this.createCalendarService.change();

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
}
