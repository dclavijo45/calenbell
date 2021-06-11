import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AddParticipantResponse } from 'src/app/interfaces/add-participant-response';
import { ClientService } from 'src/app/services/client.service';
import { InfoCurrentEventService } from 'src/app/services/info-current-event.service';
import { InfoProfileService } from 'src/app/services/info-profile.service';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import notie from 'notie';
import { LoadingParticipantsStatus } from 'src/app/interfaces/loading-participants-status';
import { DeleteParticipantResponse } from 'src/app/interfaces/delete-participant-response';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
    selector: 'app-aside-info-event',
    templateUrl: './aside-info-event.component.html',
    styleUrls: ['./aside-info-event.component.css']
})
export class AsideInfoEventComponent {

    constructor(public infoCurrentSrv: InfoCurrentEventService,
        public infoProfileSvc: InfoProfileService, private _client: ClientService,
        private _auth: TokenAuthStateService) { }

    private subAddParticipant$: Subscription;

    private subDeleteParticipant$: Subscription;

    public loading: LoadingParticipantsStatus = {
        addingParticipant: false,
        deletingParticipant: false
    }

    addParticipant(user_id: number, id_event: number): void {
        Swal.fire({
            title: '¿Está seguro de agregar el participante al evento?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
        }).then((result) => {
            if (result.isConfirmed) {
                if (this.subAddParticipant$) this.subAddParticipant$.unsubscribe();

                const data = {
                    user_invited: user_id,
                };

                this.loading.addingParticipant = true;

                this.subAddParticipant$ ? this.subAddParticipant$.unsubscribe() : true;

                this.subAddParticipant$ = this._client.postRequest(`${this._client._server}/user/participantsevent/${id_event}/`, data, localStorage.getItem('token')).subscribe(
                    (response: AddParticipantResponse) => {
                        this.loading.addingParticipant = false;

                        if (!response.auth_token) {
                            this._auth.logout();
                            return;
                        }

                        if (response.invited) {
                            notie.alert({
                                type: 'success',
                                text: "Usuario invitado correctamente",
                                stay: false,
                                time: 2,
                                position: "top"
                            });

                            this.infoCurrentSrv.getParticipants();

                        } else {
                            const reasons = {
                                0: () => {
                                    notie.alert({
                                        type: 'error',
                                        text: "No puedes invitarte a si mismo!",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                1: () => {
                                    notie.alert({
                                        type: 'error',
                                        text: "Invitación fallida",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                2: () => {
                                    notie.alert({
                                        type: 'error',
                                        text: "El Usuario invitado es inválido",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                3: () => {
                                    notie.alert({
                                        type: 'error',
                                        text: "El usuario invitado no existe!",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                4: () => {
                                    notie.alert({
                                        type: 'info',
                                        text: "No existe el grupo al que desea enviar la invitación",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                5: () => {
                                    notie.alert({
                                        type: 'info',
                                        text: "Solo el propietario del evento puede enviar invitaciones!",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                6: () => {
                                    notie.alert({
                                        type: 'info',
                                        text: "El evento debe ser de tipo grupo para invitar usuarios!",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                7: () => {
                                    notie.alert({
                                        type: 'info',
                                        text: "No eres amigo del usuario, agrégalo primero para invitarlo al evento",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                },

                                8: () => {
                                    notie.alert({
                                        type: 'info',
                                        text: "El usuario ya es participante del evento",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });

                                    this.infoCurrentSrv.getParticipants();
                                }
                            };

                            const showNotificationError = reasons[response.reason] ? reasons[response.reason] : () => {
                                let Notify = new Promise((resolve) => {
                                    notie.alert({
                                        type: 'error',
                                        text: "Ha ocurrido un problema, contacta soporte",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                    setTimeout(function () {
                                        resolve(true);
                                    }, 2000);
                                });
                                Notify.then((e) => {
                                    console.log("USER INVITED ERROR");
                                });
                            };

                            showNotificationError();
                        };

                    },
                    (error) => {
                        console.log("***ERROR***");
                        console.log(error);

                        this.loading.addingParticipant = false;
                    }
                );
            };
        });

    }

    deleteParticipants(user_id: number, id_event: number, typeEvent: number): void {
        if (typeEvent == 1) {
            return;
        };

        Swal.fire({
            title: '¿Está seguro de quitar el participante del evento?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
        }).then((result) => {

            if (result.isConfirmed) {
                const data = {
                    id_event,
                    user_delete: user_id
                };

                this.loading.deletingParticipant = true;

                this.subDeleteParticipant$ ? this.subDeleteParticipant$.unsubscribe() : true;

                this.subDeleteParticipant$ = this._client.postRequest(`${this._client._server}/user/delete/participant/`,
                    data,
                    localStorage.getItem('token'))
                    .subscribe(
                        (response: DeleteParticipantResponse) => {
                            this.loading.deletingParticipant = false;

                            if (!response.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            if (response.deleted) {
                                // notie and update list participants
                                notie.alert({
                                    type: 'success',
                                    text: "Usuario eliminado del evento correctamente",
                                    stay: false,
                                    time: 3,
                                    position: "top"
                                });

                                this.infoCurrentSrv.getParticipants();
                            };

                            if (!response.deleted) {
                                const reasons = {
                                    1: () => {
                                        notie.alert({
                                            type: 'error',
                                            text: "Evento no válido",
                                            stay: false,
                                            time: 2,
                                            position: "top"
                                        });
                                    },

                                    2: () => {
                                        notie.alert({
                                            type: 'error',
                                            text: "El usuario a eliminar no es válido",
                                            stay: false,
                                            time: 2,
                                            position: "top"
                                        });
                                    },

                                    3: () => {
                                        notie.alert({
                                            type: 'info',
                                            text: "No puedes eliminarte a si mismo del evento",
                                            stay: false,
                                            time: 2,
                                            position: "top"
                                        });
                                    },

                                    4: () => {
                                        notie.alert({
                                            type: 'error',
                                            text: "El usuario a eliminar no existe",
                                            stay: false,
                                            time: 2,
                                            position: "top"
                                        });
                                    },

                                    5: () => {
                                        notie.alert({
                                            type: 'info',
                                            text: "El evento no existe",
                                            stay: false,
                                            time: 2,
                                            position: "top"
                                        });
                                    },

                                    6: () => {
                                        notie.alert({
                                            type: 'info',
                                            text: "No eres propietario del evento!",
                                            stay: false,
                                            time: 2,
                                            position: "top"
                                        });
                                    },

                                    7: () => {
                                        notie.alert({
                                            type: 'error',
                                            text: "El evento no es de tipo grupo",
                                            stay: false,
                                            time: 2,
                                            position: "top"
                                        });
                                    },

                                    8: () => {
                                        notie.alert({
                                            type: 'info',
                                            text: "El usuario a eliminar no hace parte del evento",
                                            stay: false,
                                            time: 3,
                                            position: "top"
                                        });

                                        this.infoCurrentSrv.getParticipants();
                                    }
                                };

                                const showNotificationError = reasons[response.reason] ? reasons[response.reason] : () => {
                                    notie.alert({
                                        type: 'error',
                                        text: "Ha ocurrido un problema, contacta soporte",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                };

                                showNotificationError();
                            };

                        },
                        (error) => {
                            console.log("***ERROR***");
                            console.error(error);

                            this.loading.deletingParticipant = false;
                        }
                    );
            };

        });

    }
}