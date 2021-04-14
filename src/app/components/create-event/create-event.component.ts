import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { EventsRequest } from 'src/app/interfaces/events-request';
import { ClientService } from 'src/app/services/client.service';
import * as M from 'src/app/services/materialize.js';

@Component({
    selector: 'app-create-event',
    templateUrl: './create-event.component.html',
    styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

    constructor(public formB: FormBuilder,
        private _client: ClientService) { }

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
                this.formEvent.value.fecha = value;
            }
        );
    }

    ngOnDestroy(): void {
        // this.clearIntervalDate();
        // this.clearIntervalHour();
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
                (res: EventsRequest[]) => {
                    console.log(res);
                    this.loading = false;
                },
                (err: any) => {
                    console.log(err);
                    this.loading = false;
                }
            )
        } else {
            console.log(this.formEvent.status);
            console.log(data);
        }
    }

    setHour(h) {
        this.dataEntry.hour = h;
        // this.intervalHour = setInterval(() => {
        //     this.formEvent.value.hora = h.value;
        // }, 50)
        this.changeHour(h)
    }

    fixErrorFormEvent() {
        this.formEvent.value.hora = this.dataEntry.hour;
        this.formEvent.value.fecha = this.dataEntry.date;
    }

    setDate(f) {
        this.dataEntry.date = f;
        // this.intervalDate = setInterval(() => {
        //     this.formEvent.value.fecha = f.value;
        // }, 50)
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

    public obsHour = new BehaviorSubject<string>("");

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
