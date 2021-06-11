import { Injectable } from '@angular/core';
import { LoginResponse } from '../interfaces/login-response';

@Injectable({
    providedIn: 'root'
})
export class InfoProfileService {

    constructor() { }

    info_profile: LoginResponse = {
        email: null,
        logged: null,
        name: null,
        token: null,
        user: null,
        photo: null,
        number_tel: null,
        id: null
    };

    updateInfoProfile(): void {
        localStorage.setItem('info_profile', JSON.stringify(this.info_profile));
    }

}
