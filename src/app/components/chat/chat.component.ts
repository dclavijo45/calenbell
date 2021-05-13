import { Component, OnInit } from '@angular/core';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

    constructor(private _rootStatusPage: RootPageStatusService) { }

    ngOnInit(): void {
        // init status tag
        this._rootStatusPage.changeRootPageNumberStatus(6);
    }

    ngOnDestroy(): void {
        // kill status tag
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

}
