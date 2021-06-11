import { Component, OnInit } from '@angular/core';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';
import { ThemeColorService } from 'src/app/services/theme-color.service';

@Component({
    selector: 'app-root-home',
    templateUrl: './root-home.component.html',
    styleUrls: ['./root-home.component.css']
})
export class RootHomeComponent implements OnInit {

    constructor(private _rootPageStatus: RootPageStatusService,
        public TC: ThemeColorService) { }

    // styles
    private counterEffectStyleOpacityView: number = 0;
    public opacityView: number = 0;

    ngOnInit(): void {
        // init root page
        this._rootPageStatus.changeRootPageStatus(true);

        // style effect
        let intervalOpacity: any = setInterval(() => {
            this.opacityView += 0.1;

            this.counterEffectStyleOpacityView++;

            this.counterEffectStyleOpacityView == 10 ? clearInterval(intervalOpacity) : true;
        }, 24);
    }

    ngOnDestroy(): void {
        // kill root page
        this._rootPageStatus.changeRootPageStatus(false);
    }

}
