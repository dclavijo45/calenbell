import { Directive, ElementRef, OnInit } from '@angular/core';
import { SetScrollService } from '../services/set-scroll.service';

@Directive({
    selector: '[SetLocationScroll]'
})
export class SetLocationScrollDirective implements OnInit {

    constructor(private elementRef: ElementRef,
        private setScrollSvc: SetScrollService) {

    }

    ngOnInit(): void {
        this.setScrollSvc.listenerSetScroll().subscribe(
            (setScroll: boolean) => {
                setScroll ? this.setScrollEnd() : false;
            }
        );
    }

    private setScrollEnd(): void {
        const HeigthScroll: number = this.elementRef.nativeElement.scrollHeight;
        const currentSizeScroll: number = this.elementRef.nativeElement.scrollTop + 385;

        this.elementRef.nativeElement.scrollTop = HeigthScroll;

    }



}
