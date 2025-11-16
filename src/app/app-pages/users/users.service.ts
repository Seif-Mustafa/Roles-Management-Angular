import { GenericResponse } from '@/common/models/generic.response.model';
import { LayoutService } from '@/layout/service/layout.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './model/user.model';
@Injectable({
    providedIn: 'root'
})
export class UsersService {
    headers: HttpHeaders;
    constructor(
        private http: HttpClient,
        private layoutService: LayoutService
    ) {
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.layoutService.getLoggedUser()?.token}`,
            'Action-By': this.layoutService.getLoggedUser()?.userId!
        });
    }

    getAllUsers(): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/user`;

        return this.http.get<GenericResponse>(getUrl, {
            headers: this.headers
        });
    }

    updateUser(user: User): Observable<GenericResponse> {
        const updateUrl = `${environment.apiUrl}/user/${user.userId}`;

        return this.http.put<GenericResponse>(updateUrl, user, {
            headers: this.headers
        });
    }

    createUser(user: User): Observable<GenericResponse> {
        const createUrl = `${environment.apiUrl}/user`;

        return this.http.post<GenericResponse>(createUrl, user, {
            headers: this.headers
        });
    }

    deleteUser(userId: number): Observable<GenericResponse> {
        const deleteUrl = `${environment.apiUrl}/user/${userId}`;

        return this.http.delete<GenericResponse>(deleteUrl, {
            headers: this.headers
        });
    }

    getUserRoles(userId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/user/${userId}/roles`;

        return this.http.get<GenericResponse>(getUrl, { headers: this.headers });
    }
}
