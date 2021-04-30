import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenAuthStateService } from '../services/token-auth-state.service';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {

    constructor(private tokenAuth: TokenAuthStateService,
        private route: Router) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return new Promise((resolve, reject) => {
            this.tokenAuth.isLoggedIn().subscribe(
                (login: boolean) => {
                    if (!login) {
                        resolve(true);
                    } else {
                        this.route.navigate(['/home']);
                        resolve(false);
                    }
                }
            )
        });
    }

}
