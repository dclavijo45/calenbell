import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { EventsRequest } from 'src/app/interfaces/events-request';
import { ClientService } from 'src/app/services/client.service';
import * as M from 'src/app/services/materialize.js';
import notie from 'notie';
import { Router } from '@angular/router';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import { CreateEventRequest } from 'src/app/interfaces/create-event-request';
import { CreateCalendarService } from 'src/app/services/create-calendar.service';
import { DateInfo } from 'src/app/interfaces/date-info';

@Component({
    selector: 'app-create-event',
    templateUrl: './create-event.component.html',
    styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

    constructor(public formB: FormBuilder,
        private _client: ClientService,
        private Router: Router,
        private _auth: TokenAuthStateService,
        private createCalendarService: CreateCalendarService) { }

    public formEvent: FormGroup;
    private token: string = localStorage.getItem('token')
    private _server: string = this._client._server;
    public loading: boolean = false;
    public dataEntry = {
        title: null,
        type_ev: '',
        date: '',
        description: '',
        hour: '',
        icon: ''
    }
    private intervalHour: any;
    private intervalDate: any;
    public obsHour = new BehaviorSubject<string>("");

    ngOnInit(): void {
        M.AutoInit();
        var elems = document.querySelectorAll('.datepicker');
        var instances = M.Datepicker.init(elems, {
            format: 'yyyy-mm-dd'
        });
        this.formEvent = this.formB.group({
            titulo: ['', Validators.required],
            hora: ['', Validators.required],
            fecha: ['', Validators.required],
            descripcion: ['', Validators.required],
            tipo_evento: ['', Validators.required],
            icono: ['', Validators.required],
        });

        this.isChangedHour().subscribe(
            (value: string) => {
                this.formEvent.value.hora = value;
            }
        );

        this.isChangedDate().subscribe(
            (value: string) => {
                // this.formEvent.value.fecha = value;
            }
        );

        this.createCalendarService.listenerDetectCurrentDateChange().subscribe(
            (data: DateInfo) => {
                if (data.day && data.month && data.year) {
                    let meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

                    let mes: number = meses.indexOf(data.month) + 1;

                    this.dataEntry.date = `${data.year}-${mes <= 9 ? "0" + mes : mes}-${data.day <= 9 ? "0" + data.day : data.day}`
                    console.log("Click day!");
                }

            }
        )
    }

    createEvent() {
        const data = {
            title: this.formEvent.value.titulo,
            hour: this.formEvent.value.hora,
            date: this.formEvent.value.fecha,
            description: this.formEvent.value.descripcion,
            type_ev: this.formEvent.value.tipo_evento,
            icon: this.formEvent.value.icono,
        }
        console.log(data);

        if (data.date && data.description && data.hour && data.icon && data.title && data.type_ev) {
            this.loading = true;
            this._client.postRequest(`${this._server}/user/manage/events`, data, this.token).subscribe(
                (res: CreateEventRequest) => {
                    console.log(res);
                    this.loading = false;

                    if (!res.auth_token) this._auth.logout();

                    if (res.saved) {
                        let Notify = new Promise((resolve) => {
                            notie.alert({
                                type: 'success',
                                text: "Evento agregado",
                                stay: false,
                                time: 1,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 1000);
                        })
                        Notify.then((e) => {
                            console.log("EVENT ADD SUCCESS");
                            this.createCalendarService.createNewEventChanged();
                            this.Router.navigate(['/']);
                        });
                    } else {
                        let Notify = new Promise((resolve) => {
                            notie.alert({
                                type: 'error',
                                text: "Evento no agregado",
                                stay: false,
                                time: 1,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 1000);
                        })
                        Notify.then((e) => {
                            console.log("EVENT ADD ERROR");
                        });
                    }

                },
                (err: any) => {
                    console.log(err);
                    this.loading = false;
                }
            )
        } else {
            console.log(this.formEvent.status);
            console.log(data);
            let Notify = new Promise((resolve) => {
                notie.alert({
                    type: 'info',
                    text: "Rellene los campos",
                    stay: false,
                    time: 1,
                    position: "top"
                });
                setTimeout(function () {
                    resolve(true);
                }, 1000);
            })
            Notify.then((e) => {
                console.log("EVENT ADD ERROR");
            });
        }
    }

    setHour(h) {
        this.dataEntry.hour = h;
        this.changeHour(h)
    }

    fixErrorFormEvent() {
        this.formEvent.value.hora = this.dataEntry.hour;
        // this.formEvent.value.fecha = this.dataEntry.date;
    }

    setDate(f) {
        this.dataEntry.date = f;
        this.changeDate(f)
    }

    clearIntervalHour() {
        clearInterval(this.intervalHour);
    }

    clearIntervalDate() {
        clearInterval(this.intervalDate);
    }

    alert() {
        alert("exit")
    }


    isChangedHour(): Observable<string> {
        return this.obsHour.asObservable();
    }

    changeHour(value: string): void {
        this.obsHour.next(value);
    }

    public obsDate = new BehaviorSubject<string>("");

    isChangedDate(): Observable<string> {
        return this.obsDate.asObservable();
    }

    changeDate(value: string): void {
        this.obsDate.next(value);
    }
}
