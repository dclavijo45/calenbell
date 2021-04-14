import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DataCalendar } from 'src/app/interfaces/data-calendar';
import { DateEvents } from 'src/app/interfaces/date-events';
import { CreateCalendarService } from 'src/app/services/create-calendar.service';

@Component({
    selector: 'app-aside-info',
    templateUrl: './aside-info.component.html',
    styleUrls: ['./aside-info.component.css']
})
export class AsideInfoComponent implements OnInit {

    constructor(private createCalendarService: CreateCalendarService) { }

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
    private _DIAHOY = new Date(Date.now()).getDate();
    private _MESHOY = new Date(Date.now()).getMonth();
    private _ANIOHOY = new Date(Date.now()).getFullYear();
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

    // ngAfterViewInit(): void {
    //     alert("Loaded")
    // }

    ngOnInit(): void {
        // this.writeMonth(this.numeroDeMes);
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
                console.log();

            }
        )
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
                })
            } else if (this.dateEvents.day.includes(i) && (this.dateEvents.month).includes(month)) {
                //dias con eventos

                for (let k = 0; k < this.dateEvents.day.length; k++) {
                    if (this.dateEvents.day[k] == i && this.dateEvents.month[k] == month) {
                        let numEv = 0

                        // Lectura de numero de eventos
                        for (let k = 0; k < this.dateEvents.day.length; k++) {
                            if (this.dateEvents.day[k] == i && this.dateEvents.month[k] == month) {
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
                }



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
    };

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
    };

    isLeap() {
        return (
            (this.añoActual % 100 !== 0 && this.añoActual % 4 === 0) || this.añoActual % 400 === 0
        );
    };

    diaInicial() {
        let start = new Date(this.añoActual, this.numeroDeMes, 1);
        return start.getDay() - 1 === -1 ? 6 : start.getDay() - 1;
    };

    lastMonth() {
        if (this.numeroDeMes !== 0) {
            this.numeroDeMes--;
        } else {
            this.numeroDeMes = 11;
            this.añoActual--;
        }

        this.configurarFecha();
    };

    nextMonth() {
        if (this.numeroDeMes !== 11) {
            this.numeroDeMes++;
        } else {
            this.numeroDeMes = 0;
            this.añoActual++;
        }

        this.configurarFecha();
    };

    configurarFecha() {
        this.currentDate.setFullYear(this.añoActual, this.numeroDeMes, this.diaActual);
        // month.textContent = this.meses[this.numeroDeMes];
        // year.textContent = this.añoActual.toString();
        // dates.textContent = "";
        this.writeMonth(this.numeroDeMes);
    };

    randomClasses() {
        let classes = [{ 'b-color-1': true }, { 'b-color-2': true }, { 'b-color-3': true }, { 'b-color-4': true }, { 'b-color-5': true }, { 'b-color-6': true }, { 'b-color-7': true }, { 'b-color-8': true }, { 'b-color-9': true }]
        return classes[Math.floor(Math.random() * classes.length)];
    }
}
