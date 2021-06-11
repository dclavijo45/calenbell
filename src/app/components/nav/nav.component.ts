import { Component, OnInit } from '@angular/core';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import notie from 'notie';
// import * as M from 'src/app/services/materialize.js';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';
import { SocketWebService } from 'src/app/services/socket-web.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { InfoProfileService } from 'src/app/services/info-profile.service';
import { ThemeColorService } from 'src/app/services/theme-color.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

    constructor(public _auth: TokenAuthStateService,
        public _rootPageStatus: RootPageStatusService, public socketWebSvc: SocketWebService, public infoProfileSvc: InfoProfileService, public TC: ThemeColorService) { }

    private loggedState: boolean = false;

    public tagActive: number = null;

    ngOnInit(): void {
        this._auth.isLoggedIn().subscribe(
            (login: boolean) => {
                this.loggedState = login;
                if (login) {
                    // set token into localstorage
                    this.socketWebSvc.connectServerSocket(localStorage.getItem('token'));

                    // set info into profile
                    this.infoProfileSvc.info_profile = JSON.parse(localStorage.getItem('info_profile'))
                } else {

                    if (this.socketWebSvc.statusConnection === true) this.socketWebSvc.disconnectServerSocket();
                };

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
            Swal.fire({
                title: '¿Está seguro que desea cerrar sesión?, se perderan los mensajes de los chats que hayan guardados',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    notie.alert({
                        type: 'info',
                        text: "Se ha cerrado sesión correctamente",
                        stay: false,
                        time: 2,
                        position: "top"
                    });

                    localStorage.removeItem('chats');

                    this._auth.logout();
                };
            });
        };

    }
}
