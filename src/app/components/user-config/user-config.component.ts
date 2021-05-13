import { Component, OnInit } from '@angular/core';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';

@Component({
    selector: 'app-user-config',
    templateUrl: './user-config.component.html',
    styleUrls: ['./user-config.component.css']
})
export class UserConfigComponent implements OnInit {

    constructor(private _rootStatusPage: RootPageStatusService) { }

    ngOnInit(): void {
        // init status tag
        this._rootStatusPage.changeRootPageNumberStatus(7);
    }

    ngOnDestroy(): void {
        // kill status tag
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

}
