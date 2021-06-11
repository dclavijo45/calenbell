import { Component, OnInit } from '@angular/core';
import { ThemeColorService } from 'src/app/services/theme-color.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

    constructor(public TC: ThemeColorService) { }

    ngOnInit(): void {
    }

}
