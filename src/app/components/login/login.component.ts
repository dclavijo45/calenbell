import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { RootPageStatusService } from 'src/app/services/root-page-status.service';
import { Subscription } from 'rxjs';
import { ThemeColorService } from 'src/app/services/theme-color.service';


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
        private Router: Router,
        private _rootStatusPage: RootPageStatusService,
        public TC: ThemeColorService) {
        // init observer Google service
        this.Google.listenInfo().subscribe(
            (info: GoogleClient) => {

                console.log(info);

                if (this.action == null) return false;

                if (this.action == "register") {
                    try {
                        this.registerUser(info.GUserInfo.idToken);
                    } catch (err) {
                        this.action = null;
                        this.loading = false;
                        this.GoogleAttempt = false;
                        // console.error(err);
                        notie.alert({
                            type: 'error',
                            text: "Registro cancelado",
                            stay: false,
                            time: 3,
                            position: "top"
                        });

                    };

                } else if (this.action == "login") {
                    try {
                        this.loginUser(info.GUserInfo.idToken);
                    } catch (err) {
                        this.action = null;
                        this.GoogleAttempt = false;
                        this.loading = false;
                        // console.error(err);
                        notie.alert({
                            type: 'error',
                            text: "Inicio de sesión cancelado",
                            stay: false,
                            time: 3,
                            position: "top"
                        });
                    }
                };

            }
        );

    }

    public login: boolean = false;
    private _server: string = this._client._server;
    private subLogin$: Subscription;
    private subRegister$: Subscription;
    private subRecoverPwd$: Subscription;
    private subValidateRecoverPwd$: Subscription;
    public success: boolean = false;
    public loading: boolean = false;
    public error: boolean = false;
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

    @ViewChild('user') userField: ElementRef;
    @ViewChild('nameRegister') nameRegisterField: ElementRef;

    // styles
    private counterEffectStyleOpacityView: number = 0;
    public opacityView: number = 0;

    // Reactive forms
    public formLogin: FormGroup;
    public formRegister: FormGroup;
    public formRecoveryPwd: FormGroup;
    public formRecoveryPwdCode: FormGroup;
    public formRecoverySetPwd: FormGroup;

    // rf register
    get rf_nameRegister() { return this.formRegister.get('name') };
    get rf_emailRegister() { return this.formRegister.get('email') };
    get rf_userRegister() { return this.formRegister.get('user') };
    get rf_passwordRegister() { return this.formRegister.get('password') };

    // rf login
    get rf_userLogin() { return this.formLogin.get('user') };
    get rf_passwordLogin() { return this.formLogin.get('password') };

    ngOnInit(): void {
        // style effect
        let intervalOpacity: any = setInterval(() => {
            this.opacityView += 0.1;

            this.counterEffectStyleOpacityView++;

            this.counterEffectStyleOpacityView == 10 ? clearInterval(intervalOpacity) : true;
        }, 30);

        // change tag as active
        this._rootStatusPage.changeRootPageNumberStatus(3);

        // init materialize instance
        M.AutoInit();
        M.updateTextFields();

        // init reactive forms
        this.formLogin = this.formB.group({
            user: ['', [
                Validators.required,
                Validators.minLength(4),
                Validators.maxLength(30)
            ]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]]
        });

        this.formRegister = this.formB.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.compose([Validators.pattern('^[A-Za-z-ñÑáéíóúÁÉÍÓÚ ]+$')]),]],

            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],

            user: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40)]],

            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]]
        });

        this.formRecoveryPwd = this.formB.group({
            account: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]]
        });

        this.formRecoveryPwdCode = this.formB.group({
            code: ['', [Validators.required, Validators.minLength(6)]]
        });

        this.formRecoverySetPwd = this.formB.group({
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
            check_password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
        });
    }

    ngOnDestroy(): void {
        this._rootStatusPage.changeRootPageNumberStatus(null);
    }

    ngAfterViewInit(): void {
        this.setFocused(1);
    }

    loginUser(id_token?: string): void {
        let data = {
            user: this.formLogin.value.user.trim(),
            password: this.formLogin.value.password.trim(),
            type: this.GoogleAttempt ? 'Google' : 'normal',
            id_token: id_token || null
        };

        if (this.formLogin.valid || this.GoogleAttempt) {

            this.loading = true;

            this.subLogin$ ? this.subLogin$.unsubscribe() : true;

            this.subLogin$ = this._client.postRequest(`${this._server}/user/login`, data).subscribe(
                ((response: LoginResponse) => {
                    this.loading = false;

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
                            this._auth.login(response);
                            this.Router.navigate(['/home'])
                        });

                    } else {
                        this.loading = false;

                        if (this.GoogleAttempt) {

                            this.GoogleAttempt = false;

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

                    };

                }),

                (error => {
                    console.error(error);

                    this.loading = false;

                    notie.alert({
                        type: 'error',
                        text: "No hay internet",
                        stay: false,
                        time: 3,
                        position: "top"
                    });
                })
            );
        };

    }

    registerUser(id_token?: string): void {
        let data = {
            name: this.formRegister.value.name.trim(),
            email: this.formRegister.value.email.trim(),
            user: this.formRegister.value.user.trim(),
            password: this.formRegister.value.password.trim(),
            type: this.action ? 'Google' : 'normal',
            id_token: id_token || null
        }

        if (this.formRegister.valid || this.GoogleAttempt) {

            this.loading = true;

            this.subRegister$ ? this.subRegister$.unsubscribe() : true;

            this.subRegister$ = this._client.postRequest(`${this._server}/user/register`, data).subscribe(
                ((response: RegisterResponse) => {
                    this.loading = false;
                    this.action = null;
                    this.GoogleAttempt = false;

                    if (response.registered) {
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
                        });
                    } else {
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
                        });
                    };
                }),

                (error => {
                    console.error(error);

                    this.loading = false;
                    this.action = null;
                    this.GoogleAttempt = false;
                    notie.alert({
                        type: 'error',
                        text: "No hay internet",
                        stay: false,
                        time: 3,
                        position: "top"
                    });
                })
            );
        };

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

            let account: string = this.formRecoveryPwd.value.account.toString();

            let typeAccount: string = '';

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

            this.subRecoverPwd$ ? this.subRecoverPwd$.unsubscribe() : true;

            this.subRecoverPwd$ = this._client.postRequest(`${this._server}/user/recovery`, data).subscribe(
                (res: RecoveryAttempt) => {
                    this.loading = false;

                    if (res.recovering) {
                        this.recoveryPwd = false;
                        this.recoveryPwdCode = true;
                        this.recoveryAttemptCode = 1;
                        this.token_recovery = res.token;
                        this.clockInit();
                    } else {
                        notie.alert({
                            type: 'error',
                            text: "No existe la cuenta que intenta recuperar",
                            stay: false,
                            time: 2,
                            position: "top"
                        });
                    };
                },
                (error: any) => {
                    this.loading = false;

                    console.error(error);
                }
            );
        } else {
            notie.alert({
                type: 'info',
                text: "Rellena el campo",
                stay: false,
                time: 2,
                position: "top"
            });
        };
    }

    validateRecoveryAccCode(): void {
        if (this.formRecoveryPwdCode.value.code) {
            let code: string = this.formRecoveryPwdCode.value.code.toString();
            const data = {
                token: this.token_recovery,
                code: code
            }

            this.loading = true;

            this.subValidateRecoverPwd$ ? this.subValidateRecoverPwd$.unsubscribe() : true;

            this.subValidateRecoverPwd$ = this._client.postRequest(`${this._server}/user/validate/recoverycode`, data).subscribe(
                (res: RecoveryAccount) => {
                    this.loading = false;

                    if (res.recovered) {
                        this.token_recovery = res.token;
                        this.recoveryPwdSetPwd = true;
                        this.recoveryPwd = false;
                        this.recoveryPwdCode = false;

                        this.intervalTimeClock ? clearInterval(this.intervalTimeClock) : true;

                        this.clockInit();

                        notie.alert({
                            type: 'info',
                            text: "Codigo validado correctamente",
                            stay: false,
                            time: 2,
                            position: "top"
                        });
                    } else {
                        notie.alert({
                            type: 'error',
                            text: "Codigo incorrecto",
                            stay: false,
                            time: 2,
                            position: "top"
                        });
                    };
                },
                (error: any) => {
                    this.loading = false;

                    console.error(error);
                }
            );

        } else {
            notie.alert({
                type: 'info',
                text: "Rellena el campo",
                stay: false,
                time: 2,
                position: "top"
            });
        };
    }

    validateChangePwd(): void {
        if (this.formRecoverySetPwd.valid) {
            const pwd: string = this.formRecoverySetPwd.value.password;
            const check_pwd: string = this.formRecoverySetPwd.value.check_password;

            if (pwd == check_pwd) {
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

    setFocused(action: number): void {
        action == 1 ? this.userField.nativeElement.focus() : this.nameRegisterField.nativeElement.focus();
    }
}
