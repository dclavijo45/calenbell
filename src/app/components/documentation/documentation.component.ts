import { Component, OnInit } from '@angular/core';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';

@Component({
    selector: 'app-documentation',
    templateUrl: './documentation.component.html',
    styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {

    constructor(private _rootStatusPage: RootPageStatusService) { }

    ngOnInit(): void {
        this._rootStatusPage.changeRootPageNumberStatus(1);
    }

    ngOnDestroy(): void {
        this._rootStatusPage.changeRootPageStatus(false);
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

}
