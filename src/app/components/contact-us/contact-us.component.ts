import { Component, OnInit } from '@angular/core';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';

@Component({
    selector: 'app-contact-us',
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {

    constructor(private _rootStatusPage: RootPageStatusService) { }

    ngOnInit(): void {
        this._rootStatusPage.changeRootPageNumberStatus(4);
    }

    ngOnDestroy(): void {
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

}
