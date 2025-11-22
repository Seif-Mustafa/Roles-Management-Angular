import { GenericResponse } from '@/common/models/generic.response.model';
import { LayoutService } from '@/layout/service/layout.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RoleDetailsResponse } from './model/role-details.response.model';
import { RoleDetailsRequest } from './model/role-details.request.model';
@Injectable({
    providedIn: 'root'
})
export class RoleDetailsService {
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

    getRoleDetails(roleId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/roles/role-details/${roleId}`;

        return this.http.get<GenericResponse>(getUrl, {
            headers: this.headers
        });
    }

    saveRoleDetails(roleDetails: RoleDetailsRequest): Observable<GenericResponse> {
        const putUrl = `${environment.apiUrl}/roles/role-details/${roleDetails.roleId}`;

        return this.http.put<GenericResponse>(putUrl, roleDetails, {
            headers: this.headers
        });
    }
}
