import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Location } from '@angular/common';
import { ClientService } from 'src/app/services/client.service';
import * as M from 'src/app/services/materialize.js';
import notie from 'notie';
import { Router } from '@angular/router';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import { ManageEventRequest } from 'src/app/interfaces/manage-event-request';
import { CreateCalendarService } from 'src/app/services/create-calendar.service';
import { DateInfo } from 'src/app/interfaces/date-info';
import { ListEmojisService } from 'src/app/services/list-emojis.service';
import { InterfaceEmojis, InterfaceEmojisView } from 'src/app/interfaces/interface-emojis';
import { ControlEventsService } from 'src/app/services/control-events.service';

@Component({
    selector: 'app-manage-event',
    templateUrl: './manage-event.component.html',
    styleUrls: ['./manage-event.component.css']
})
export class ManageEventComponent implements OnInit {

    constructor(public formB: FormBuilder,
        private _client: ClientService,
        private Router: Router,
        private _auth: TokenAuthStateService,
        private createCalendarService: CreateCalendarService,
        private listEmojiService: ListEmojisService,
        private location: Location,
        private controlEventsService: ControlEventsService) { }

    public actionEvent: string = null;
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
    public emojis: InterfaceEmojis[] = this.listEmojiService._emojis;
    public emojiView: InterfaceEmojisView = {
        init: 0,
        end: 12
    }
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

        this.controlEventsService.listenerActionEventChange().subscribe(
            (action: string) => {
                this.actionEvent = action;
                if (this.actionEvent == 'edit') {
                    this.dataEntry.date = `${this.controlEventsService.controlEventData.year}-${this.controlEventsService.controlEventData.month <= 9 ? '0' + this.controlEventsService.controlEventData.month : this.controlEventsService.controlEventData.month}-${this.controlEventsService.controlEventData.day <= 9 ? '0' + this.controlEventsService.controlEventData.day : this.controlEventsService.controlEventData.day}`

                    this.dataEntry.description = this.controlEventsService.controlEventData.description;

                    this.dataEntry.hour = this.controlEventsService.controlEventData.hour;

                    this.dataEntry.icon = this.controlEventsService.controlEventData.icon;

                    this.dataEntry.title = this.controlEventsService.controlEventData.title;

                    this.dataEntry.type_ev = this.controlEventsService.controlEventData.type_ev;
                    console.log(this.dataEntry.type_ev);

                }
            }
        );
    }

    ngOnDestroy(): void {
        this.controlEventsService.actionEvent = null;
        this.controlEventsService.resetControlEventData()
        this.controlEventsService.actionChangedNow();
    }

    manageEvent() {
        if (this.actionEvent == 'edit') {
            this.editEvent();
            return true;
        }
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
                (res: ManageEventRequest) => {
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

    editEvent() {
        const data = {
            title: this.formEvent.value.titulo,
            hour: this.convertTo24Hour(this.formEvent.value.hora.replace(" ", "")),
            date: this.formEvent.value.fecha,
            description: this.formEvent.value.descripcion,
            type_ev: this.formEvent.value.tipo_evento,
            icon: this.formEvent.value.icono,
        }
        console.log(data);

        if (data.date && data.description && data.hour && data.icon && data.title && data.type_ev) {
            this.loading = true;
            this._client.putRequest(`${this._server}/user/manage/events`, data, this.token).subscribe(
                (res: ManageEventRequest) => {
                    console.log(res);
                    this.loading = false;

                    if (!res.auth_token) this._auth.logout();

                    if (res.saved) {
                        let Notify = new Promise((resolve) => {
                            notie.alert({
                                type: 'success',
                                text: "Evento editado",
                                stay: false,
                                time: 1,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 1000);
                        })
                        Notify.then((e) => {
                            console.log("EVENT EDIT SUCCESS");
                            this.createCalendarService.createNewEventChanged();
                            this.Router.navigate(['/home']);
                        });
                    } else {
                        let Notify = new Promise((resolve) => {
                            notie.alert({
                                type: 'error',
                                text: "Evento no editado",
                                stay: false,
                                time: 1,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 1000);
                        })
                        Notify.then((e) => {
                            console.log("EVENT EDIT ERROR");
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
                console.log("EVENT EDIT ERROR");
            });
        }
    }

    convertTo24Hour(time_ch) {
        console.log(time_ch);
        let time = time_ch

        // let time: any = time_ch.slice(0, 2) + ':' + time_ch.slice(2);

        let hours = parseInt(time.substr(0, 2));
        if (time.indexOf('AM') != -1 && hours == 12) {
            time = time.replace('12', '0');
        }
        if (time.indexOf('PM') != -1 && hours < 12) {
            time = time.replace(hours, (hours + 12));
        }
        return time.replace(/(AM|PM)/, '');
    }

    convertTo12Hour(time) {
        // Check correct time format and split into components
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) { // If time format correct
            time = time.slice(1);  // Remove full string match value
            time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(''); // return adjusted time or original string
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

    alert() {
        alert("alert")
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

    setEmoji(codeEmoji: string): void {
        this.dataEntry.icon.length == 0 ? this.dataEntry.icon = this.dataEntry.icon + codeEmoji : false;
    }

    changeViewEmojis(action: string): void {
        if (this.emojiView.init != 0 && this.emojiView.end != 12 && action == "left") {
            this.emojiView.init = this.emojiView.init - 16;
            this.emojiView.end = this.emojiView.end - 16;
        }

        if (action == "rigth" && this.emojiView.end <= this.emojis.length) {
            this.emojiView.init = this.emojiView.init + 16;
            this.emojiView.end = this.emojiView.end + 16;
        }

        action == 'delete' ? this.dataEntry.icon = '' : false;
    }

    onBack() {
        this.location.back();
    }
}