import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericResponse } from '@/common/models/generic.response.model';
import { UserLogin } from './models/user-login.model';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private postUrl = `${environment.apiUrl}/auth/login`;

    checkCredentials(userLogin: UserLogin): Observable<GenericResponse> {
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
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.post<GenericResponse>(this.postUrl, userLogin, { headers });
    }

    constructor(private http: HttpClient) {}
}
