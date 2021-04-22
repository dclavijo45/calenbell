import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ClientService } from './client.service';

@Injectable({
    providedIn: 'root'
})
export class TokenAuthStateService {

    constructor(private router: Router,
        private client: ClientService) { }

    private token_jwt: string;
    isLogin = new BehaviorSubject<boolean>(this.checkToken());

    public checkToken(): boolean {
        return !!localStorage.getItem('token')
    }


    login(token: string): void {
        localStorage.setItem('token', token);
        this.isLogin.next(true);
    }

    validateJwt() {
        try {
            this.token_jwt = localStorage.getItem('token');
            this.client.postRequest(`${this.client._server}/checkjwt`, {}, this.token_jwt).subscribe(
                (response: any) => {
                    let res = JSON.parse(JSON.stringify(response));
                    if (!res.auth_token) {
                        this.isLogin.next(false);

                        return false;
                    } else {
                        this.isLogin.next(true);

                        return true;
                    }
                },
                (error) => {
                    console.log(`ERROR Q1 IN GUARD ${error}`);
                    this.isLogin.next(false);

                    return false;
                }
            )
        } catch (error) {
            console.log(`ERROR Q2 IN GUARD ${error}`);
            this.isLogin.next(false);

            return false;
        }
    }

    logout(): void {
        localStorage.removeItem('token');
        //temp
        this.router.navigate(['/login'])

        this.isLogin.next(false);
    }

    isLoggedIn(): Observable<boolean> {
        return this.isLogin.asObservable();
    }
}
