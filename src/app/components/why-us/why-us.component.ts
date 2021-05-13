import { Component, OnInit } from '@angular/core';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';

@Component({
    selector: 'app-why-us',
    templateUrl: './why-us.component.html',
    styleUrls: ['./why-us.component.css']
})
export class WhyUsComponent implements OnInit {

    constructor(private _rootStatusPage: RootPageStatusService) { }

    ngOnInit(): void {
        this._rootStatusPage.changeRootPageNumberStatus(2);
    }

    ngOnDestroy(): void {
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

}
