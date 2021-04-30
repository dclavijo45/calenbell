import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as M from 'src/app/services/materialize.js';
import notie from 'notie';
import { LoginResponse } from 'src/app/interfaces/login-response';
import { RegisterResponse } from 'src/app/interfaces/register-response';
import { ClientService } from 'src/app/services/client.service';
import { GoogleClientService } from 'src/app/services/google-client.service';
import { GoogleClient } from 'src/app/interfaces/google-client';
import { RecoveredStatus, RecoveryAccount, RecoveryAttempt } from 'src/app/interfaces/recovery-account';
import { TokenAuthStateService } from 'src/app/services/token-auth-state.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    constructor(
        public formB: FormBuilder,
        private _client: ClientService,
        private Google: GoogleClientService,
        private _auth: TokenAuthStateService,
        private Router: Router) { }

    public login: boolean = false;
    private _server: string = this._client._server;
    public success: boolean = false;
    public loading: boolean = false;
    public error: boolean = false;
    public formLogin: FormGroup;
    public formRegister: FormGroup;
    public formRecoveryPwd: FormGroup;
    public formRecoveryPwdCode: FormGroup;
    public formRecoverySetPwd: FormGroup;
    public recoveryPwd: boolean = false;
    public recoveryPwdCode: boolean = false;
    public recoveryPwdSetPwd: boolean = false;
    private action: string = null;
    public timeClock: any = {
        minute: 0,
        second: 0,
        active: false
    };
    public recoveryAttemptCode: number = 0;
    public intervalTimeClock: any;
    private token_recovery: string = null;
    public GoogleAttempt: boolean = false;

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
        });
        this.formRecoveryPwdCode = this.formB.group({
            code: ['', Validators.required]
        });

        this.formRecoverySetPwd = this.formB.group({
            password: ['', Validators.required],
            check_password: ['', Validators.required],
        });

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
            type: this.GoogleAttempt ? 'Google' : 'normal',
            id_token: id_token || null
        }

        if (this.formLogin.valid || this.GoogleAttempt) {

            this.loading = true;

            this._client.postRequest(`${this._server}/user/login`, data).subscribe(
                ((response: LoginResponse) => {
                    this.loading = false;
                    console.log(`RESPONSE: ${this.action}`);
                    console.log(response);


                    if (response.logged) {
                        this.action = null;
                        let loggedNotify = new Promise((resolve) => {
                            notie.alert({
                                type: 'success',
                                text: "✔ Inicio correcto",
                                stay: false,
                                time: 1,
                                position: "top"
                            });
                            setTimeout(function () {
                                resolve(true);
                            }, 1000);
                        });
                        loggedNotify.then((e) => {
                            console.log("LOGGED");
                            this._auth.login(response.token);
                            this.Router.navigate(['/home'])
                        });
                    } else {
                        this.loading = false;
                        if (this.GoogleAttempt) {
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
                text: "Rellena todos los campos",
                stay: false,
                time: 3,
                position: "top"
            });
        }

    }

    googleInit(action: string): void {
        this.loading = true;
        this.action = action;
        this.GoogleAttempt = true;
        this.Google.GoogleInit();
    }

    recoveryAccount(): void {
        if (this.formRecoveryPwd.valid) {
            this.loading = true;
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

            this._client.postRequest(`${this._server}/user/recovery`, data).subscribe(
                (res: RecoveryAttempt) => {
                    this.loading = false;
                    console.log(res);
                    if (res.recovering) {
                        this.recoveryPwd = false;
                        this.recoveryPwdCode = true;
                        this.recoveryAttemptCode = 1;
                        this.token_recovery = res.token;
                        this.clockInit();
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

    validateRecoveryAccCode(): void {
        if (this.formRecoveryPwdCode.valid) {
            let code = this.formRecoveryPwdCode.value.code;
            if (code.length == 6) {
                const data = {
                    token: this.token_recovery,
                    code: code
                }
                this.loading = true;

                this._client.postRequest(`${this._server}/user/validate/recoverycode`, data).subscribe(
                    (res: RecoveryAccount) => {
                        this.loading = false;
                        if (res.recovered) {
                            this.token_recovery = res.token;
                            this.recoveryPwdSetPwd = true;
                            this.recoveryPwd = false;
                            this.recoveryPwdCode = false;
                            if (this.intervalTimeClock) {
                                clearInterval(this.intervalTimeClock);
                            };
                            this.clockInit();

                            let registerNotify = new Promise((resolve) => {
                                notie.alert({
                                    type: 'info',
                                    text: "Codigo validado correctamente",
                                    stay: false,
                                    time: 2,
                                    position: "top"
                                });
                                setTimeout(function () {
                                    resolve(true);
                                }, 2000);
                            })
                            registerNotify.then((e) => {
                                console.log("RECOVERY SUCCESS");
                            });
                        } else {
                            let registerNotify = new Promise((resolve) => {
                                notie.alert({
                                    type: 'error',
                                    text: "Codigo incorrecto",
                                    stay: false,
                                    time: 2,
                                    position: "top"
                                });
                                setTimeout(function () {
                                    resolve(true);
                                }, 2000);
                            })
                            registerNotify.then((e) => {
                                console.log("RECOVERY SUCCESS");
                            });
                        }
                    },
                    (error: any) => {
                        this.loading = false;
                        console.log("ERROR");
                        console.error(error);
                    }
                );

            } else {
                let registerNotify = new Promise((resolve) => {
                    notie.alert({
                        type: 'error',
                        text: "Ingresa un código válido",
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

    validateChangePwd(): void {
        if (this.formRecoverySetPwd.valid) {
            const pwd = this.formRecoverySetPwd.value.password;
            const check_pwd = this.formRecoverySetPwd.value.check_password;

            if (pwd == check_pwd) {
                console.log(pwd.length);

                if (pwd.length >= 8) {
                    this.loading = true;
                    const data = {
                        token: this.token_recovery,
                        pwd: pwd
                    }

                    this._client.postRequest(`${this._server}/user/validate/changepwd`, data).subscribe(
                        (res: RecoveredStatus) => {
                            this.loading = false;
                            if (res.recovered) {
                                let registerNotify = new Promise((resolve) => {
                                    notie.alert({
                                        type: 'success',
                                        text: "Contraseña reestablecida correctamente",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                    setTimeout(function () {
                                        resolve(true);
                                    }, 2000);
                                })
                                registerNotify.then((e) => {
                                    console.log("RECOVERY RECOVERED SUCCESS");
                                    this.cancelRecoveryPwd();
                                });
                            } else {
                                let registerNotify = new Promise((resolve) => {
                                    notie.alert({
                                        type: 'error',
                                        text: "No se ha podido cambiar la contraseña",
                                        stay: false,
                                        time: 2,
                                        position: "top"
                                    });
                                    setTimeout(function () {
                                        resolve(true);
                                    }, 2000);
                                })
                                registerNotify.then((e) => {
                                    console.log("RECOVERY ERROR");
                                });
                            }
                        },
                        (error: any) => {
                            this.loading = false;
                            console.log("ERROR");
                            console.error(error);
                        }
                    )
                } else {
                    let registerNotify = new Promise((resolve) => {
                        notie.alert({
                            type: 'info',
                            text: "Elije una contraseña más segura",
                            stay: false,
                            time: 2,
                            position: "top"
                        });
                        setTimeout(function () {
                            resolve(true);
                        }, 2000);
                    })
                    registerNotify.then((e) => {
                        console.log("RECOVERY ERROR");
                    });
                }

            } else {
                let registerNotify = new Promise((resolve) => {
                    notie.alert({
                        type: 'info',
                        text: "Las contraseñas no coinciden",
                        stay: false,
                        time: 2,
                        position: "top"
                    });
                    setTimeout(function () {
                        resolve(true);
                    }, 2000);
                })
                registerNotify.then((e) => {
                    console.log("RECOVERY ERROR");
                });
            }

        } else {
            let registerNotify = new Promise((resolve) => {
                notie.alert({
                    type: 'info',
                    text: "Rellena los campos",
                    stay: false,
                    time: 2,
                    position: "top"
                });
                setTimeout(function () {
                    resolve(true);
                }, 2000);
            })
            registerNotify.then((e) => {
                console.log("RECOVERY WAITING...");
            });
        }
    }

    clockInit(): void {
        this.timeClock.minute = 4;
        this.timeClock.second = 59;
        this.timeClock.active = true;
        this.intervalTimeClock = setInterval(() => {
            if (this.timeClock.minute == 0 && this.timeClock.second == 0) {
                this.timeClock.active = false;
                this.recoveryPwdCode = false;
                this.recoveryPwdSetPwd = false;
                this.recoveryPwd = true;
                setTimeout(() => {
                    this.recoveryAttemptCode = 0;
                }, 2500);
                clearInterval(this.intervalTimeClock)
            } else {
                if (this.timeClock.second == 0 && this.timeClock.minute != 0) {
                    this.timeClock.minute--;
                    this.timeClock.second = 59;
                }
                // setTimeout(() => {
                //     console.log("Second Clock");
                // }, 1000);
                this.timeClock.second--;
            }
        }, 1000)
    }

    cancelRecoveryPwd(): void {
        if (this.intervalTimeClock != null) {
            clearInterval(this.intervalTimeClock);
        }
        this.recoveryAttemptCode = 0;
        this.timeClock.active = false;
        this.timeClock.minute = 0;
        this.timeClock.second = 0;
        this.recoveryPwdCode = false;
        this.recoveryPwd = false;
        this.recoveryPwdSetPwd = false;
        this.token_recovery = null;
    }
}
