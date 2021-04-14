import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
        this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    }

    FacebookInit(): void {
        this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
    }

    signOut(): void {
        this.authService.signOut();
    }

    init(): void {
        this.authService.authState.subscribe((user) => {
            this.user = user;
            this.GoogleInfo.logged = user ? true : false;
            this.GoogleInfo.GUserInfo = user ? user : null;
            this._listener.next(this.GoogleInfo);
        });
    }

    _listener = new BehaviorSubject<GoogleClient>(this.GoogleInfo);

    listenInfo(): Observable<GoogleClient> {
        this.init();
        return this._listener.asObservable();
    }
}
