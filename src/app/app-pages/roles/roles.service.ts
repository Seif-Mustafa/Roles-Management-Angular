import { GenericResponse } from '@/common/models/generic.response.model';
import { LayoutService } from '@/layout/service/layout.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Role } from './model/role.model';

@Injectable({
    providedIn: 'root'
})
export class RolesService {
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

    getAllRoles(): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/roles`;

        return this.http.get<GenericResponse>(getUrl, {
            headers: this.headers
        });
    }

    createRole(role: Role): Observable<GenericResponse> {
        const createUrl = `${environment.apiUrl}/roles`;
        return this.http.post<GenericResponse>(createUrl, role, { headers: this.headers });
    }

    updateRole(role: Role): Observable<GenericResponse> {
        const updateUrl = `${environment.apiUrl}/roles/${role.roleId}`;

        return this.http.put<GenericResponse>(updateUrl, role, { headers: this.headers });
    }

    deleteRole(roleId: number): Observable<GenericResponse> {
        const deleteUrl = `${environment.apiUrl}/roles/${roleId}`;

        return this.http.delete<GenericResponse>(deleteUrl, { headers: this.headers });
    }

    getRoleUsers(roleId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/roles/${roleId}/users`;

        return this.http.get<GenericResponse>(getUrl, { headers: this.headers });
    }
}
