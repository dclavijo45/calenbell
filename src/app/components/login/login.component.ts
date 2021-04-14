import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as M from 'src/app/services/materialize.js';
import notie from 'notie';
import { LoginResponse } from 'src/app/interfaces/login-response';
import { RegisterResponse } from 'src/app/interfaces/register-response';
import { ClientService } from 'src/app/services/client.service';
import { GoogleClientService } from 'src/app/services/google-client.service';
import { GoogleClient } from 'src/app/interfaces/google-client';
import { RecoveryAccount, RecoveryAttempt } from 'src/app/interfaces/recovery-account';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    constructor(
        public formB: FormBuilder,
        private _client: ClientService,
        private Google: GoogleClientService) { }

    public login: boolean = false;
    private _server: string = this._client._server;
    public success: boolean = false;
    public loading: boolean = false;
    public error: boolean = false;
    public formLogin: FormGroup;
    public formRegister: FormGroup;
    public formRecoveryPwd: FormGroup;
    public recoveryPwd: boolean = false;
    private action: string = null;

    ngOnInit(): void {
        M.AutoInit();
        M.updateTextFields();
        this.formLogin = this.formB.group({
            user: ['', Validators.required],
            password: ['', Validators.required]
        });
        this.formRegister = this.formB.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            user: ['', Validators.required],
            password: ['', Validators.required]
        });
        this.formRecoveryPwd = this.formB.group({
            account: ['', Validators.required]
        })

        this.Google.listenInfo().subscribe(
            (info: GoogleClient) => {
                console.log(`ACTION: ${this.action}`);

                if (this.action == "register") {
                    try {
                        this.registerUser(info.GUserInfo.idToken);
                    } catch (err) {
                        this.action = null;
                        this.loading = false;
                        console.error(err);
                        let registerNotify = new Promise((resolve) => {
                            notie.alert({
                                type: 'error',
                                text: "Registro cancelado",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 3000);
                        })
                        registerNotify.then((e) => {
                            console.log("REGISTER CANCEL");
                        });
                    }

                } else if (this.action == "login") {
                    try {
                        this.loginUser(info.GUserInfo.idToken);
                    } catch (err) {
                        this.action = null;
                        this.loading = false;
                        console.error(err);
                        let registerNotify = new Promise((resolve) => {
                            notie.alert({
                                type: 'error',
                                text: "Inicio de sesión cancelado",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 3000);
                        })
                        registerNotify.then((e) => {
                            console.log("LOGIN CANCEL");
                        });
                    }
                }

                this.loading = false;
                console.log(info);
            }
        );
    }

    loginUser(id_token?: string): void {
        let data = {
            user: this.formLogin.value.user,
            password: this.formLogin.value.password,
            type: this.action ? 'Google' : 'normal',
            id_token: id_token || null
        }

        if (this.formLogin.valid || this.action) {

            this.loading = true;

            this._client.postRequest(`${this._server}/user/login`, data).subscribe(
                ((response: LoginResponse) => {
                    this.loading = false;

                    if (response.logged) {
                        this.action = null;
                        let loggedNotify = new Promise((resolve) => {
                            notie.alert({
                                type: 'info',
                                text: "✔ Inicio correcto",
                                stay: false,
                                time: 2,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 2000);
                        });
                        loggedNotify.then((e) => {
                            console.log("LOGGED");
                        });
                    } else {
                        this.loading = false;
                        if (this.action) {
                            this.action = null;
                            notie.alert({
                                type: 'info',
                                text: "Registrate para poder iniciar con Google!",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                        } else {
                            notie.alert({
                                type: 'error',
                                text: "Usuario o contraseña inválidos",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                        }

                    }
                }),

                (error => {
                    console.error(error);
                    this.loading = false;
                    notie.alert({
                        type: 'error',
                        text: "<div>No hay internet</div>",
                        stay: false,
                        time: 3,
                        position: "top"
                    });
                })
            )
        } else {
            notie.alert({
                type: 'info',
                text: "Rellena todos los campos",
                stay: false,
                time: 3,
                position: "top"
            });
        }

    }

    registerUser(id_token?: string): void {
        let data = {
            name: this.formRegister.value.name,
            email: this.formRegister.value.email,
            user: this.formRegister.value.user,
            password: this.formRegister.value.password,
            type: this.action ? 'Google' : 'normal',
            id_token: id_token || null
        }

        if (this.formRegister.valid || this.action) {

            this.loading = true;

            this._client.postRequest(`${this._server}/user/register`, data).subscribe(
                ((response: RegisterResponse) => {
                    if (response.registered) {
                        this.loading = false;
                        this.action = null;
                        let registerNotify = new Promise((resolve) => {
                            notie.alert({
                                type: 'info',
                                text: "✔ registrado",
                                stay: false,
                                time: 2,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 2000);
                        });
                        registerNotify.then((e) => {
                            this.login = false;
                            console.log("REGISTERED");
                        });
                    } else {
                        this.loading = false;
                        let registerNotify = new Promise((resolve) => {
                            notie.alert({
                                type: 'error',
                                text: "Ya se encuentra registrado, proceda a iniciar sesión",
                                stay: false,
                                time: 3,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 2000);
                        })
                        registerNotify.then((e) => {
                            this.login = false;
                            console.error("NOT REGISTERED");
                        });
                    }
                }),

                (error => {
                    console.error(error);
                    this.loading = false;
                    this.action = null;
                    notie.alert({
                        type: 'error',
                        text: "No hay internet",
                        stay: false,
                        time: 3,
                        position: "top"
                    });
                })
            )
        } else {
            notie.alert({
                type: 'info',
                text: "<div>Rellena todos los campos</div>",
                stay: false,
                time: 3,
                position: "top"
            });
        }

    }

    googleInit(action: string): void {
        this.loading = true;
        this.action = action;
        this.Google.GoogleInit();
    }

    recoveryAccount() {
        if (this.formRecoveryPwd.valid) {
            let account = this.formRecoveryPwd.value.account.toString();
            let typeAccount = '';

            if (account.length == 10 && !account.includes('@') && !account.includes('.')) {
                typeAccount = 'number';
                account = `57${this.formRecoveryPwd.value.account}`
            } else {
                typeAccount = 'email';
            }
            let data = {
                account: account,
                type: typeAccount
            };

            this.loading = true;

            this._client.postRequest(`${this._server}/user/recovery`, data).subscribe(
                (res: RecoveryAttempt) => {
                    this.loading = false;
                    console.log(res);
                    if (res.recovering) {

                    } else {
                        let registerNotify = new Promise((resolve) => {
                            notie.alert({
                                type: 'error',
                                text: "No existe la cuenta que intenta recuperar",
                                stay: false,
                                time: 2,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 2000);
                        })
                        registerNotify.then((e) => {
                            console.log("RECOVERY FAILED");
                        });
                    };
                },
                (error: any) => {
                    this.loading = false;
                    console.error(error)
                    alert("Recovering error")
                }
            );
        } else {
            let registerNotify = new Promise((resolve) => {
                notie.alert({
                    type: 'info',
                    text: "Rellena el campo",
                    stay: false,
                    time: 2,
                    position: "top"
                });
                setTimeout(function () {
                    resolve(true);
                }, 2000);
            })
            registerNotify.then((e) => {
                console.log("RECOVERY CANCEL");
            });
        }
    }
}
