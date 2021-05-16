import { Component, OnInit } from '@angular/core';
import { InfoCurrentEventService } from 'src/app/services/info-current-event.service';

@Component({
    selector: 'app-aside-info-event',
    templateUrl: './aside-info-event.component.html',
    styleUrls: ['./aside-info-event.component.css']
})
export class AsideInfoEventComponent implements OnInit {

    constructor(private infoCurrentSrv: InfoCurrentEventService) { }

    ngOnInit(): void {

    }

}
