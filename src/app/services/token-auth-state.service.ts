import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginResponse } from '../interfaces/login-response';
import { ClientService } from './client.service';

@Injectable({
    providedIn: 'root'
})
export class TokenAuthStateService {

    constructor(private router: Router,
        private client: ClientService) { }

    isLogin = new BehaviorSubject<boolean>(this.checkToken());

    public checkToken(): boolean {
        return !!localStorage.getItem('token')
    }


    login(info_profile: LoginResponse): void {
        localStorage.setItem('token', info_profile.token);
        localStorage.setItem('info_profile', JSON.stringify(info_profile))
        this.isLogin.next(true);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('info_profile');

        this.router.navigate(['/login'])

        this.isLogin.next(false);
    }

    isLoggedIn(): Observable<boolean> {
        return this.isLogin.asObservable();
    }
}
