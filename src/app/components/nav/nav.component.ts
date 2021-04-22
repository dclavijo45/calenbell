import { Component, OnInit } from '@angular/core';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import notie from 'notie';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

    constructor(private _auth: TokenAuthStateService) { }

    private loggedState: boolean = false;

    ngOnInit(): void {
        this._auth.isLoggedIn().subscribe(
            (login: boolean) => {
                this.loggedState = login;
            }
        )
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
