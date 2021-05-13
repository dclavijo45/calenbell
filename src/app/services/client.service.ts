import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ClientService {

    constructor(private http: HttpClient) { }

    public _server: string = 'http://localhost:5000';

    getRequest(route: string, token?: string): Observable<any> {

        let config: any = {
            responseType: "json"
        }
        if (token) {
            const header = new HttpHeaders().set('Authorization', `Bearer ${token}`);
            config["headers"] = header;
        }

        return this.http.get(route, config);
    }

    postRequest(route: string, data?: any, token?: string): Observable<any> {

        if (token) {
            let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` })

            return this.http.post(route, data, { headers });
        } else {
            let config: any = {
                responseType: "json"
            }
            return this.http.post(route, data, config);
        }
    }

    putRequest(route: string, data?: any, token?: string): Observable<any> {

        if (token) {
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`).set('Content-Type', `application/json`)

            return this.http.put(route, data, { headers });
        } else {
            let config: any = {
                responseType: "json"
            }
            return this.http.put(route, data, config);
        }
    }

    deleteRequest(route: string, data: string, token: string): Observable<any> {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`).set('Content-Type', `application/json`).set('Body', `Data ${data}`);

        return this.http.delete(route, { headers });
    }
}
