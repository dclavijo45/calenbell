import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SocialAuthService } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from
    "angularx-social-login";
import { SocialUser } from "angularx-social-login";
import { GoogleClient } from '../interfaces/google-client';

@Injectable({
    providedIn: 'root'
})
export class GoogleClientService {

    constructor(private authService: SocialAuthService) { }

    private user: SocialUser = null;

    public GoogleInfo: GoogleClient = {
        logged: false,
        GUserInfo: this.user
    }

    GoogleInit(): void {
        let interval;


        this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)
            .then((value) => {

            }).catch((err) => {
                if (err == "Login providers not ready yet. Are there errors on your console?") {
                    setTimeout(() => {
                        this.GoogleInit();
                    }, 2000);
                } else {
                    this._listener.next(null);
                };

            });

    }

    FacebookInit(): void {
        this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
    }

    signOut(): void {
        this.authService.signOut();
    }

    public _listener = new Subject<GoogleClient>();

    init(): void {
        this.authService.authState.subscribe((user) => {
            this.user = user;
            this.GoogleInfo.logged = user ? true : false;
            this.GoogleInfo.GUserInfo = user ? user : null;
            this._listener.next(this.GoogleInfo);
        });
    }

    listenInfo(): Observable<GoogleClient> {
        this.init();
        return this._listener.asObservable();
    }
}
