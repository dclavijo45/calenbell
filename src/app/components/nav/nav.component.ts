import { Component, OnInit } from '@angular/core';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import notie from 'notie';
// import * as M from 'src/app/services/materialize.js';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

    constructor(public _auth: TokenAuthStateService,
        public _rootPageStatus: RootPageStatusService) { }

    private loggedState: boolean = false;

    public tagActive: number = null;

    ngOnInit(): void {
        this._auth.isLoggedIn().subscribe(
            (login: boolean) => {
                this.loggedState = login;
            }
        );

        this._rootPageStatus.listenRootPageNumberStatus().subscribe(
            (status: number) => {
                this.tagActive = status;
            }
        );

    }

    logout(): void {
        if (this.loggedState) {
            let Notify = new Promise((resolve) => {
                notie.alert({
                    type: 'info',
                    text: "Se ha cerrado sesión correctamente",
                    stay: false,
                    time: 2,
                    position: "top"
                });
                setTimeout(function () {
                    resolve(true);
                }, 2000);
            })
            Notify.then((e) => {
                console.log("SESSION EXIT SUCCESS");
            });

            this._auth.logout();
        }
    }

}
