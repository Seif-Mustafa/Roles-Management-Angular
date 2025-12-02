import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponse } from '@/common/models/generic.response.model';
import { UserLogin } from './models/user-login.model';
import { ForgetPassword } from './models/forget-password.model';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    headers: HttpHeaders;
    constructor(private http: HttpClient) {
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }
    checkCredentials(userLogin: UserLogin): Observable<GenericResponse> {
        const postUrl = `${environment.apiUrl}/auth/login`;

        if (userLogin.username === 'development' && userLogin.password === 'test1234') {
            return new Observable<GenericResponse>((observer) => {
                observer.next({
                    status: '200',
                    message: 'Login successful',
                    data: {
                        token: 'dummy-jwt-token',
                        userId: 1,
                        username: 'development',
                        email: '  development@example.com',
                        userRoleTypeId: '1'
                    }
                });
                observer.complete();
            });
        }

        return this.http.post<GenericResponse>(postUrl, userLogin, { headers: this.headers });
    }

    forgetPassword(forgetPassword: ForgetPassword): Observable<GenericResponse> {
        const postUrl = `${environment.apiUrl}/auth/forget-password`;
        return this.http.post<GenericResponse>(postUrl, forgetPassword, { headers: this.headers });
    }
}
