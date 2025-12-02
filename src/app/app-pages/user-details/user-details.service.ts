import { GenericResponse } from '@/common/models/generic.response.model';
import { LayoutService } from '@/layout/service/layout.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserDetailsRequest } from './model/user-details.request.model';


@Injectable({
    providedIn: 'root'
})
export class UserDetailsService {
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

    getUserDetails(userId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/user/user-details/${userId}`;

        return this.http.get<GenericResponse>(getUrl, {
            headers: this.headers
        });
    }

    saveUserDetails(userDetails: UserDetailsRequest): Observable<GenericResponse> {
        const putUrl = `${environment.apiUrl}/user/user-details/${userDetails.userId}`;

        return this.http.put<GenericResponse>(putUrl, userDetails, {
            headers: this.headers
        });
    }
}
