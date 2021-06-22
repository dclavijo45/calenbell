import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RootPageStatusService } from 'src/app/services/root-page-status.service';
import * as M from 'src/app/services/materialize.js';
import { InfoProfileService } from 'src/app/services/info-profile.service';
import notie from 'notie';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ClientService } from 'src/app/services/client.service';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import { ResponseUserConfig } from 'src/app/interfaces/response-user-config';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ThemeColorService } from 'src/app/services/theme-color.service';
import { SocketWebService } from 'src/app/services/socket-web.service';

@Component({
    selector: 'app-user-config',
    templateUrl: './user-config.component.html',
    styleUrls: ['./user-config.component.css']
})
export class UserConfigComponent implements OnInit, OnDestroy, AfterViewInit {

    constructor(private _rootStatusPage: RootPageStatusService,
        public infoProfileSvc: InfoProfileService, private _client: ClientService, private _auth: TokenAuthStateService,
        public formBuilder: FormBuilder,
        public TC: ThemeColorService,
        private socketWebSvc: SocketWebService) { }

    @ViewChild('tabInstance') tabElement: ElementRef;

    readerImg = new FileReader();

    readonly consts = {
        img: 'https://www.dropbox.com/s/4nqmlzijvaeqtts/avatar%20-%20profile.jpeg?dl=1'
    }

    // DOM Access (DA)

    // Inputs (DA)
    @ViewChild('InputName') InputName: ElementRef;
    @ViewChild('InputUserName') InputUserName: ElementRef;
    @ViewChild('InputEmail') InputEmail: ElementRef;
    @ViewChild('InputTel') InputTel: ElementRef;
    @ViewChild('InputPassword') InputPassword: ElementRef;

    // Subscriptions for uploading actions
    sub = {
        img$: null,
        name$: null,
        username$: null,
        email$: null,
        tel$: null,
        password$: null
    }

    // Actions (status)
    actions = {
        isUpdatingImgProfile: false,
        isUpdatingName: false,
        isUpdatingUserName: false,
        isUpdatingEmail: false,
        isUpdatingNumberTel: false,
        isUpdatingPwd: false
    }

    // Modes (status)
    modes = {
        isThemeLight: true,
        isNotifyGroupMsg: true,
        isNotifyOneOneMsg: true
    }

    // values
    values = {
        newImgSet: null
    }

    // loadings
    loading = {
        img: false,
        name: false,
        username: false,
        email: false,
        tel: false,
        password: false
    }

    // Reactive forms (RF)
    formName: FormGroup;
    formUserName: FormGroup;
    formEmail: FormGroup;
    formTel: FormGroup;
    formPassword: FormGroup;

    // getters for RF
    get rf_Name() { return this.formName.get('name') };
    get rf_UserName() { return this.formUserName.get('username') };
    get rf_Email() { return this.formEmail.get('email') };
    get rf_Tel() { return this.formTel.get('tel') };
    get rf_Password() { return this.formPassword.get('password') };

    ngOnInit(): void {
        // init status tag
        this._rootStatusPage.changeRootPageNumberStatus(7);

        // init RF
        this.formName = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.compose([Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')]),]]
        });

        this.formUserName = this.formBuilder.group({
            username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40)]]
        });

        this.formEmail = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]]
        });

        this.formTel = this.formBuilder.group({
            tel: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern(/^[0-9]\d*$/)]]
        });

        this.formPassword = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]]
        });

        // fix for RF validation
        this.formName.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => !this.formName.touched ? this.formName.markAllAsTouched() : true);

        this.formUserName.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => !this.formUserName.touched ? this.formUserName.markAllAsTouched() : true);

        this.formEmail.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => !this.formEmail.touched ? this.formEmail.markAllAsTouched() : true);

        this.formTel.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => !this.formTel.touched ? this.formTel.markAllAsTouched() : true);

        this.formPassword.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => !this.formPassword.touched ? this.formPassword.markAllAsTouched() : true);
    }

    ngOnDestroy(): void {
        // kill status tag
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

    ngAfterViewInit(): void {
        // init styles
        const options = {
            swipeable: true
        };

        const element = this.tabElement.nativeElement;
        const instance = M.Tabs.init(element, options);

        // instance.select('entrycustomizable');

        // init theme color mode config
        if (this.TC.THEME_ACTIVE == 0) this.modes.isThemeLight = true;

        if (this.TC.THEME_ACTIVE == 1) this.modes.isThemeLight = false;

        // init config Notify
        this.modes.isNotifyOneOneMsg = this.socketWebSvc.NOTIFY.msg_one_one;

        this.modes.isNotifyGroupMsg = this.socketWebSvc.NOTIFY.msg_group;
    }

    setNewImg(event): void {
        const typeFile = event.target.files.length == 1 ? event.target.files[0].type : null;

        if (typeFile == 'image/jpeg' || typeFile == 'image/png') {

            this.readerImg.readAsDataURL(event.target.files[0]);

            this.readerImg.onload = () => {
                this.values.newImgSet = this.readerImg.result;

                this.actions.isUpdatingImgProfile = true;
            };

        } else {
            if (typeFile != null) {
                notie.alert({
                    type: 'info',
                    text: "Debes seleccionar una imagen",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            };

        }
    }

    setImgDefault(): void {
        Swal.fire({
            title: '¿Está seguro de borrar su foto de perfil?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
        }).then((result) => {

            if (result.isConfirmed) {
                this.loading.img = true;

                const requestData = {
                    action: 'delete',
                    area: 'img',
                    resource: 0
                };

                this.sub.img$ ? this.sub.img$.unsubscribe() : true;

                this.sub.img$ = this._client.postRequest(`${this._client._server}/user/profile/settings/`, requestData, localStorage.getItem('token')).subscribe(
                    (response: ResponseUserConfig) => {
                        this.loading.img = false;

                        if (!response.auth_token) {
                            this._auth.logout();
                            return;
                        };

                        if (response.changed) {
                            this.values.newImgSet = null;

                            this.actions.isUpdatingImgProfile = false;

                            notie.alert({
                                type: 'success',
                                text: "Foto de perfil borrada con éxito",
                                stay: false,
                                time: 3,
                                position: "top"
                            });

                            this.infoProfileSvc.info_profile.photo = this.consts.img;

                            this.infoProfileSvc.updateInfoProfile();
                        };

                        if (!response.auth_token) {
                            this.showErrors(response.reason);
                        };

                    },
                    (error) => {
                        console.log("***ERROR***");
                        console.error(error);
                        this.loading.img = false;

                    }
                )


            };
        });
    }

    setNameChange(): void {
        this.actions.isUpdatingName = true;

        setTimeout(() => {
            this.InputName.nativeElement.focus();
        }, 250);
    }

    setUserNameChange(): void {
        if (this.infoProfileSvc.info_profile.user != 'GoogleUser') {
            this.actions.isUpdatingUserName = true;

            setTimeout(() => {
                this.InputUserName.nativeElement.focus();
            }, 250);
        };

    }

    setEmailChange(): void {
        if (this.infoProfileSvc.info_profile.user != 'GoogleUser') {
            this.actions.isUpdatingEmail = true;

            setTimeout(() => {
                this.InputEmail.nativeElement.focus();
            }, 250);
        };

    }

    setNumberTelChange(): void {
        this.actions.isUpdatingNumberTel = true;

        setTimeout(() => {
            this.InputTel.nativeElement.focus();
        }, 250)
    }

    setPasswordChange(): void {
        if (this.infoProfileSvc.info_profile.user != 'GoogleUser') {
            this.actions.isUpdatingPwd = true;

            setTimeout(() => {
                this.InputPassword.nativeElement.focus();
            }, 250);
        };
    }

    setThemeColorChange(): void {
        if (this.modes.isThemeLight) {

            this.modes.isThemeLight = false;

            this.TC.changeThemeColor(1);
        } else {

            this.modes.isThemeLight = true;

            this.TC.changeThemeColor(0);
        };

        this.TC.emitChangeState();
    }

    setNotifyModeOneOneChange(): void {
        if (this.modes.isNotifyOneOneMsg) {
            this.modes.isNotifyOneOneMsg = false;

            this.socketWebSvc.setNotifyChange(1, false);
        } else {
            this.modes.isNotifyOneOneMsg = true;

            this.socketWebSvc.setNotifyChange(1, true);
        }
    }

    setNotifyModeGroupChange(): void {
        if (this.modes.isNotifyGroupMsg) {
            this.modes.isNotifyGroupMsg = false;

            this.socketWebSvc.setNotifyChange(2, false);
        } else {
            this.modes.isNotifyGroupMsg = true;

            this.socketWebSvc.setNotifyChange(2, true);
        }
    }

    fixSwitch(event: Event): void {
        event.preventDefault();
    }

    cancelSetNewImg(): void {
        Swal.fire({
            title: '¿Está seguro de no cambiar su foto de perfil?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
        }).then((result) => {

            if (result.isConfirmed) {
                this.values.newImgSet = null;

                this.actions.isUpdatingImgProfile = false;

                notie.alert({
                    type: 'info',
                    text: "Cambio de imagen cancelado",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            };
        });

    }

    cancelChangeName(): void {
        if (this.formName.valid) {
            Swal.fire({
                title: '¿Está seguro de no cambiar su nombre?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.formName.markAsUntouched();
                    this.formName.reset();

                    this.actions.isUpdatingName = false
                };
            });
        };

        if (this.formName.invalid) {
            this.formName.markAsUntouched();
            this.formName.reset();

            this.actions.isUpdatingName = false;
        };
    }

    cancelChangeUserName(): void {
        if (this.formUserName.valid) {
            Swal.fire({
                title: '¿Está seguro de no cambiar su nombre?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.formUserName.markAsUntouched();
                    this.formUserName.reset();

                    this.actions.isUpdatingUserName = false;
                };
            });
        };

        if (this.formUserName.invalid) {
            this.formUserName.markAsUntouched();
            this.formUserName.reset();

            this.actions.isUpdatingUserName = false;
        };
    }

    cancelChangeEmail(): void {
        if (this.formEmail.valid) {
            Swal.fire({
                title: '¿Está seguro de no cambiar su correo?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.formEmail.markAsUntouched();
                    this.formEmail.reset();

                    this.actions.isUpdatingEmail = false;
                };
            });
        };

        if (this.formEmail.invalid) {
            this.formEmail.markAsUntouched();
            this.formEmail.reset();

            this.actions.isUpdatingEmail = false;
        };
    }

    cancelChangeTel(): void {
        if (this.formTel.valid) {
            Swal.fire({
                title: '¿Está seguro de no cambiar su número de teléfono?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.formTel.markAsUntouched();
                    this.formTel.reset();

                    this.actions.isUpdatingNumberTel = false;
                };
            });
        };

        if (this.formTel.invalid) {
            this.formTel.markAsUntouched();
            this.formTel.reset();

            this.actions.isUpdatingNumberTel = false;
        };
    }

    cancelChangePassword(): void {
        if (this.formPassword.valid) {
            Swal.fire({
                title: '¿Está seguro de no cambiar su contraseña?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.formPassword.markAsUntouched();
                    this.formPassword.reset();

                    this.actions.isUpdatingPwd = false;
                };
            });
        };

        if (this.formPassword.invalid) {
            this.formPassword.markAsUntouched();
            this.formPassword.reset();

            this.actions.isUpdatingPwd = false;
        };
    }

    sendImgChange(): void {
        if (!this.values.newImgSet) {
            notie.alert({
                type: 'error',
                text: "Debes seleccionar una imagen!",
                stay: false,
                time: 3,
                position: "top"
            });

            this.actions.isUpdatingImgProfile = false;
        };

        if (this.values.newImgSet) {
            Swal.fire({
                title: '¿Está seguro de cambiar su foto de perfil?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.loading.img = true;

                    const resource = this.values.newImgSet.slice(0, 23) == "data:image/jpeg;base64," ? this.values.newImgSet.slice(23) : this.values.newImgSet.slice(22);

                    const requestData = {
                        action: 'update',
                        area: 'img',
                        resource
                    };

                    this.sub.img$ ? this.sub.img$.unsubscribe() : true;

                    this.sub.img$ = this._client.postRequest(`${this._client._server}/user/profile/settings/`, requestData, localStorage.getItem('token')).subscribe(
                        (response: ResponseUserConfig) => {
                            this.loading.img = false;

                            if (!response.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            if (response.changed) {
                                this.infoProfileSvc.info_profile.photo = this.values.newImgSet;

                                this.infoProfileSvc.updateInfoProfile();

                                this.actions.isUpdatingImgProfile = false;

                                this.values.newImgSet = null;

                                notie.alert({
                                    type: 'success',
                                    text: "Foto de perfil cambiada con éxito",
                                    stay: false,
                                    time: 3,
                                    position: "top"
                                });
                            };

                            if (!response.changed) this.showErrors(response.reason);
                        },
                        (error) => {
                            console.log("***ERROR***");
                            console.error(error);
                            this.loading.img = false;

                            notie.alert({
                                type: 'error',
                                text: "No hay internet",
                                stay: false,
                                time: 3,
                                position: "top"
                            });

                        }
                    );
                };
            });
        };
    }

    sendNameChange(): void {
        if (this.formName.valid) {
            Swal.fire({
                title: '¿Está seguro de cambiar su nombre?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.loading.name = true;

                    const resource: string = this.formName.value.name;

                    const requestData = {
                        action: 'update',
                        area: 'name',
                        resource
                    };

                    this.sub.name$ ? this.sub.name$.unsubscribe() : true;

                    this.sub.name$ = this._client.postRequest(`${this._client._server}/user/profile/settings/`, requestData, localStorage.getItem('token')).subscribe(
                        (response: ResponseUserConfig) => {
                            this.loading.name = false;
                            console.log(response);

                            if (!response.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            if (response.changed) {
                                this.infoProfileSvc.info_profile.name = resource;

                                this.infoProfileSvc.updateInfoProfile();

                                this.actions.isUpdatingName = false;

                                this.formName.reset();

                                // this.formName.markAsUntouched();

                                notie.alert({
                                    type: 'success',
                                    text: "Nombre cambiado con éxito",
                                    stay: false,
                                    time: 3,
                                    position: "top"
                                });
                            };

                            if (!response.changed) {
                                this.showErrors(response.reason);

                                this.actions.isUpdatingName = false;

                                this.formName.reset();
                            };


                        },
                        (error) => {
                            console.log("***ERROR***");
                            console.log(error);

                            this.loading.name = false;

                            notie.alert({
                                type: 'error',
                                text: "No hay internet",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                        }
                    );

                };

            });
        };
    }

    sendUserNameChange(): void {
        if (this.formUserName.valid) {
            Swal.fire({
                title: '¿Está seguro de cambiar su nombre de usuario?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.loading.username = true;

                    const resource: string = this.formUserName.value.username;

                    const requestData = {
                        action: 'update',
                        area: 'username',
                        resource
                    };

                    this.sub.username$ ? this.sub.username$.unsubscribe() : true;

                    this.sub.username$ = this._client.postRequest(`${this._client._server}/user/profile/settings/`, requestData, localStorage.getItem('token')).subscribe(
                        (response: ResponseUserConfig) => {
                            this.loading.username = false;

                            if (!response.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            if (response.changed) {
                                this.infoProfileSvc.info_profile.user = resource;

                                this.infoProfileSvc.updateInfoProfile();

                                this.actions.isUpdatingUserName = false;

                                this.formUserName.reset();

                                notie.alert({
                                    type: 'success',
                                    text: "Nombre de usuario cambiado con éxito",
                                    stay: false,
                                    time: 3,
                                    position: "top"
                                });
                            };

                            if (!response.changed) {
                                this.showErrors(response.reason);

                                this.actions.isUpdatingUserName = false;

                                this.formUserName.reset();
                            };


                        },
                        (error) => {
                            console.log("***ERROR***");
                            console.log(error);

                            this.loading.username = false;

                            notie.alert({
                                type: 'error',
                                text: "No hay internet",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                        }
                    );

                };

            });
        };
    }

    sendEmailChange(): void {
        if (this.formEmail.valid) {
            Swal.fire({
                title: '¿Está seguro de cambiar su correo?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.loading.email = true;

                    const resource: string = this.formEmail.value.email;

                    const requestData = {
                        action: 'update',
                        area: 'email',
                        resource
                    };

                    this.sub.email$ ? this.sub.email$.unsubscribe() : true;

                    this.sub.email$ = this._client.postRequest(`${this._client._server}/user/profile/settings/`, requestData, localStorage.getItem('token')).subscribe(
                        (response: ResponseUserConfig) => {
                            this.loading.email = false;

                            if (!response.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            if (response.changed) {
                                this.infoProfileSvc.info_profile.email = resource;

                                this.infoProfileSvc.updateInfoProfile();

                                this.actions.isUpdatingEmail = false;

                                this.formEmail.reset();

                                notie.alert({
                                    type: 'success',
                                    text: "Correo cambiado con éxito",
                                    stay: false,
                                    time: 3,
                                    position: "top"
                                });
                            };

                            if (!response.changed) {
                                this.showErrors(response.reason);

                                this.actions.isUpdatingEmail = false;

                                this.formEmail.reset();
                            };


                        },
                        (error) => {
                            console.log("***ERROR***");
                            console.log(error);

                            this.loading.email = false;

                            notie.alert({
                                type: 'error',
                                text: "No hay internet",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                        }
                    );

                };

            });
        };
    }

    sendTelChange(): void {
        if (this.formTel.valid) {
            Swal.fire({
                title: '¿Está seguro de cambiar su número de teléfono?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.loading.tel = true;

                    const resource: number = this.formTel.value.tel;

                    const requestData = {
                        action: 'update',
                        area: 'tel',
                        resource
                    };

                    this.sub.tel$ ? this.sub.tel$.unsubscribe() : true;

                    this.sub.tel$ = this._client.postRequest(`${this._client._server}/user/profile/settings/`, requestData, localStorage.getItem('token')).subscribe(
                        (response: ResponseUserConfig) => {
                            this.loading.tel = false;

                            if (!response.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            if (response.changed) {
                                this.infoProfileSvc.info_profile.number_tel = resource;

                                this.infoProfileSvc.updateInfoProfile();

                                this.actions.isUpdatingNumberTel = false;

                                this.formTel.reset();

                                notie.alert({
                                    type: 'success',
                                    text: "Número de teléfono cambiado con éxito",
                                    stay: false,
                                    time: 3,
                                    position: "top"
                                });
                            };

                            if (!response.changed) {
                                this.showErrors(response.reason);

                                this.actions.isUpdatingNumberTel = false;

                                this.formTel.reset();
                            };

                        },
                        (error) => {
                            console.log("***ERROR***");
                            console.log(error);

                            this.loading.tel = false;

                            notie.alert({
                                type: 'error',
                                text: "No hay internet",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                        }
                    );

                };

            });
        };
    }

    sendPwdChange(): void {
        if (this.formPassword.valid) {
            Swal.fire({
                title: '¿Está seguro de cambiar su contraseña?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Continuar`,
                denyButtonText: `Cancelar`,
            }).then((result) => {

                if (result.isConfirmed) {
                    this.loading.password = true;

                    const resource: number = this.formPassword.value.password;

                    const requestData = {
                        action: 'update',
                        area: 'password',
                        resource
                    };

                    this.sub.password$ ? this.sub.password$.unsubscribe() : true;

                    this.sub.password$ = this._client.postRequest(`${this._client._server}/user/profile/settings/`, requestData, localStorage.getItem('token')).subscribe(
                        (response: ResponseUserConfig) => {
                            this.loading.password = false;

                            if (!response.auth_token) {
                                this._auth.logout();
                                return;
                            };

                            if (response.changed) {
                                this.actions.isUpdatingPwd = false;

                                this.formPassword.reset();

                                notie.alert({
                                    type: 'success',
                                    text: "Contraseña cambiada con éxito",
                                    stay: false,
                                    time: 3,
                                    position: "top"
                                });
                            };

                            if (!response.changed) {
                                this.showErrors(response.reason);

                                this.actions.isUpdatingPwd = false;

                                this.formPassword.reset();
                            };

                        },
                        (error) => {
                            console.log("***ERROR***");
                            console.log(error);

                            this.loading.password = false;

                            notie.alert({
                                type: 'error',
                                text: "No hay internet",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                        }
                    );

                };

            });
        };
    }

    showErrors(reason: number): void {
        const reasons = {
            1: () => {
                notie.alert({
                    type: 'error',
                    text: "Accion no válida",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            2: () => {
                notie.alert({
                    type: 'error',
                    text: "Área a modificar no válida",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            3: () => {
                notie.alert({
                    type: 'error',
                    text: "Accion no válida",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            4: () => {
                notie.alert({
                    type: 'error',
                    text: "Accion no válida para el nombre",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            5: () => {
                notie.alert({
                    type: 'error',
                    text: "Accion no válida para el nombre de usuario",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            6: () => {
                notie.alert({
                    type: 'error',
                    text: "Accion no válida para el correo",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            7: () => {
                notie.alert({
                    type: 'error',
                    text: "Accion no válida para el número de teléfono",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            8: () => {
                notie.alert({
                    type: 'error',
                    text: "Accion no válida para la contraseña",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            13: () => {
                notie.alert({
                    type: 'error',
                    text: "Nombre inválido, escríbalo nuevamente",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            15: () => {
                notie.alert({
                    type: 'info',
                    text: "El nombre de usuario no ha cambiado!",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            16: () => {
                notie.alert({
                    type: 'info',
                    text: "El nombre no ha cambiado!",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            17: () => {
                notie.alert({
                    type: 'error',
                    text: "Nombre de usuario inválido",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            19: () => {
                notie.alert({
                    type: 'error',
                    text: "Acción no permitida debido a que iniciaste sesión con Google",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            21: () => {
                notie.alert({
                    type: 'error',
                    text: "Correo no válido, escríbelo nuevamente",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            24: () => {
                notie.alert({
                    type: 'info',
                    text: "El correo no ha cambiado!",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            26: () => {
                notie.alert({
                    type: 'error',
                    text: "Número de teléfono no válido, escríbelo nuevamente",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            27: () => {
                notie.alert({
                    type: 'error',
                    text: "Accion no válida para la foto de perfil",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            30: () => {
                notie.alert({
                    type: 'info',
                    text: "El número de teléfono no ha cambiado!",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            31: () => {
                notie.alert({
                    type: 'info',
                    text: "El número de teléfono ya lo tiene otra persona, elije otro",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            32: () => {
                notie.alert({
                    type: 'info',
                    text: "El nombre de usuario ya lo tiene otra persona, elije otro!",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            33: () => {
                notie.alert({
                    type: 'info',
                    text: "El correo ya lo tiene otra persona, elije otro!",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            },
            35: () => {
                notie.alert({
                    type: 'error',
                    text: "La contraseña no es válida, elije otra",
                    stay: false,
                    time: 3,
                    position: "top"
                });
            }

        };

        const showReason = reasons[reason] ? reasons[reason] : () => {
            notie.alert({
                type: 'error',
                text: "Hubo un problema interno, por favor contacta soporte",
                stay: false,
                time: 2,
                position: "top"
            });
        };

        showReason();
    }

}
