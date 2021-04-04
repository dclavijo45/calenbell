import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as M from 'src/app/services/materialize.js';
import notie from 'notie';
import { LoginResponse } from 'src/app/interfaces/login-response';
import { RegisterResponse } from 'src/app/interfaces/register-response';
import { ClientService } from 'src/app/services/client.service';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    constructor(
        public formB: FormBuilder,
        private _client: ClientService) { }

    public login: boolean = false;
    private _server: string = this._client._server;
    public success: boolean = false;
    public loading: boolean = false;
    public error: boolean = false;
    public formLogin: FormGroup;
    public formRegister: FormGroup;

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
    }

    loginUser() {
        const data = {
            user: this.formLogin.value.user,
            password: this.formLogin.value.password
        }

        if (this.formLogin.valid) {
            this.loading = true;

            this._client.postRequest(`${this._server}/api/v1/user/login`, data).subscribe(
                ((response: LoginResponse) => {
                    if (response.logged) {
                        this.loading = false;
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
                        notie.alert({
                            type: 'error',
                            text: "<div>Inicio incorrecto</div>",
                            stay: false,
                            time: 3,
                            position: "top"
                        })
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
                text: "<div>Rellena todos los campos</div>",
                stay: false,
                time: 3,
                position: "top"
            });
        }
    }

    registerUser() {
        const data = {
            name: this.formRegister.value.name,
            email: this.formRegister.value.email,
            user: this.formRegister.value.user,
            password: this.formRegister.value.password
        }

        if (this.formRegister.valid) {
            this.loading = true;

            this._client.postRequest(`${this._server}/api/v1/user/register`, data).subscribe(
                ((response: RegisterResponse) => {
                    if (response.registered) {
                        this.loading = false;
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
                        notie.alert({
                            type: 'error',
                            text: "<div>No se ha registrado!, intenta nuevamente</div>",
                            stay: false,
                            time: 3,
                            position: "top"
                        })
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
                text: "<div>Rellena todos los campos</div>",
                stay: false,
                time: 3,
                position: "top"
            });
        }
    }
}
