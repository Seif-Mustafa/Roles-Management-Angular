import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { LayoutService } from '@/layout/service/layout.service';
import { GenericResponse } from '@/common/models/generic.response.model';
import { Activity } from './models/activity.model';
import { GenericIdName } from '@/common/models/generic-id-name.model';



@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {
  constructor(private http: HttpClient, private layoutService: LayoutService) { }

  getAllActivitiesPagination(page?: number, size?: number, activityType?: number, selectedUser?: GenericIdName, dateFrom?: string, dateTo?: string, overdue?: boolean, done?: boolean): Observable<any> {
    const pageNumber = page ?? 0;
    const pageSize = size ?? 5;
    let getUrl = `${environment.apiUrl}/activities/get-all-by-user-Page?page=${pageNumber}&size=${pageSize}`;
    if (overdue) {
      getUrl = `${environment.apiUrl}/activities/get-overdue?page=${pageNumber}&size=${pageSize}`;
    } else if (done) {
      getUrl = `${environment.apiUrl}/activities/get-done?page=${pageNumber}&size=${pageSize}`;
    } else {
      if (dateFrom !== undefined) {
        getUrl += `&fromDate=${dateFrom}`;
      }
      if (dateTo !== undefined) {
        getUrl += `&toDate=${dateTo}`;
      }
    }


    // userName=${tempUser.name}&assignee=${tempUser.id}
    if (selectedUser !== undefined && selectedUser?.id != undefined) {
      getUrl += `&assignee=${selectedUser.id}`;
    } else {
      getUrl += `&userName=${this.layoutService.getLoggedUser()?.username}&assignee=${this.layoutService.getLoggedUser()?.userId}`;
    }
    if (activityType !== undefined) {
      getUrl += `&activityType=${activityType}`;
    }


    // console.log(getUrl);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });


    return this.http.get(getUrl, {
      headers
    });
  }

  getUsers(): Observable<any> {
    const user = this.layoutService.getLoggedUser();
    if (user?.userRoleTypeId == null) {
      return new Observable<any>();
    }

    let getUrl = `${environment.apiUrl}/activities/assigned-to?userId=${user?.userId}&roleId=${user?.userRoleTypeId}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });


    return this.http.get(getUrl, {
      headers
    });
  }

  createActivity(activity: Activity): Observable<GenericResponse> {
    const postUrl = `${environment.apiUrl}/activities/create-all`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`,
      'X-User': this.layoutService.getLoggedUser()?.username!
    });
    return this.http.post<GenericResponse>(postUrl, [activity], {
      headers
    });
  }

  getAllOrganizationsIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/orgs/ids-and-names`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }

  getAllPersonsIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/persons/ids-and-names`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }
  getAllDealsIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/deals/id-and-name`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }

  postActivity(activity: Activity): Observable<GenericResponse> {
    const postUrl = `${environment.apiUrl}/activities/create-all`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`,
      'X-User': this.layoutService.getLoggedUser()?.userId!
    });

    return this.http.post<GenericResponse>(postUrl, [activity], {
      headers
    });
  }
  updateActivity(activity: Activity): Observable<GenericResponse> {
    const putUrl = `${environment.apiUrl}/activities/update-all`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`,
      'X-User': this.layoutService.getLoggedUser()?.userId!
    });

    return this.http.put<GenericResponse>(putUrl, [activity], {
      headers
    });
  }


}