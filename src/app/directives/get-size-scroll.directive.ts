import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';
import { EventsRequest } from '../interfaces/events-request';
import { CreateCalendarService } from '../services/create-calendar.service';
import { InfoCurrentEventService } from '../services/info-current-event.service';

@Directive({
    selector: '[GetSizeScroll]'
})
export class GetSizeScrollDirective {

    constructor(private elementRef: ElementRef,
        private infoCurrentEventService: InfoCurrentEventService,
        private createCalendarService: CreateCalendarService) {
    }

    // every event = 62
    // not event = 53
    // size scroll =+ 301
    getScrollTop() {
        const TIME_OUT = 2000;
        const HeigthScroll: number = this.elementRef.nativeElement.scrollHeight;
        const currentSizeScroll: number = this.elementRef.nativeElement.scrollTop + 301;
        const lazyLoadCharge: number = this.infoCurrentEventService.lazyLoadCharge;
        let totalEvents: number = 0;

        let elementsTotalEQ60: number = 0;
        this.createCalendarService.listenerEventsRequestChange().subscribe(
            (res: EventsRequest[]) => {
                console.log("listen");
                totalEvents = res.length;
                elementsTotalEQ60 = res.length / 20;
            }
        )

        console.clear();
        console.log(`Scroll Max Heigth: ${HeigthScroll}`);

        console.log(`Current location scroll: ${currentSizeScroll}`);

        console.log(`Elements for 20: ${elementsTotalEQ60}`);

        console.log(`LazyLoadCharge: ${lazyLoadCharge}`);


        for (let i = 1; i <= elementsTotalEQ60; i++) {
            let division: number = parseInt((HeigthScroll / i).toFixed());
            console.log(`División de 60 #${i}: ${division}`);
            console.log(((elementsTotalEQ60 + 1) * 20));


            if (currentSizeScroll === HeigthScroll && lazyLoadCharge === 20 && totalEvents != 20) {
                console.log(`Primera división activa`);

                // estético
                this.createCalendarService.loadingHome = true;
                this.createCalendarService.LoadingChanged();
                setTimeout(() => {
                    this.createCalendarService.loadingHome = false;
                    this.createCalendarService.LoadingChanged();

                    this.infoCurrentEventService.lazyLoadCharge = this.infoCurrentEventService.lazyLoadCharge + 20;
                    this.infoCurrentEventService.lazyLoadChanged();
                }, TIME_OUT);

                break;
            } else if (currentSizeScroll === HeigthScroll && lazyLoadCharge != 20 && (lazyLoadCharge + 20 <= (elementsTotalEQ60 + 1) * 20)) {

                // estético
                this.createCalendarService.loadingHome = true;
                this.createCalendarService.LoadingChanged();
                setTimeout(() => {
                    this.createCalendarService.loadingHome = false;
                    this.createCalendarService.LoadingChanged();

                    this.infoCurrentEventService.lazyLoadCharge = this.infoCurrentEventService.lazyLoadCharge + 20;
                    this.infoCurrentEventService.lazyLoadChanged();
                }, TIME_OUT);

                break;
            }

        }

    }

    @HostListener('scroll') onMouseEnter() {
        this.getScrollTop();
    }
}
