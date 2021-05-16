import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {

    constructor(private _rootStatusPage: RootPageStatusService) { }

    public isChatting: boolean = false;

    // style effect
    public opacityView: number = 0;

    ngOnInit(): void {

        // init status tag
        this._rootStatusPage.changeRootPageNumberStatus(6);
    }

    ngAfterViewInit(): void {
        // init view style
        this.initStyleEffect();
    }

    ngOnDestroy(): void {
        // kill status tag
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

    initStyleEffect(): Promise<boolean> {
        // style effect
        return new Promise((resolve) => {
            let intervalOpacityClear: Promise<boolean> = new Promise((resolve) => {
                let deleteOpacity = setInterval(() => {
                    this.opacityView -= 0.1;

                    if (this.opacityView <= 0) {
                        resolve(true);
                        clearInterval(deleteOpacity);
                    }
                }, 30);
            });

            intervalOpacityClear.then((res) => {

                let intervalOpacity: Promise<boolean> = new Promise((resolve) => {
                    let addOpacity = setInterval(() => {
                        this.opacityView += 0.1;

                        if (this.opacityView >= 1) {
                            resolve(true);
                            clearInterval(addOpacity);
                        }
                    }, 30);
                });

                intervalOpacity.then((res) => resolve(true));

            });
        });

    }

    initChat(): void {
        let styleInit: Promise<boolean> = this.initStyleEffect();

        styleInit.then((res) => {
            this.isChatting = true;
        });

    }

}
