import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { LayoutService } from '@/layout/service/layout.service';
import { GenericResponse } from '../models/generic.response.model';



@Injectable({
  providedIn: 'root'
})
export class CommonRequestsService {
  constructor(private http: HttpClient, private layoutService: LayoutService) { }

  getFiscalYearIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-company-setting-fiscal-years/names-and-ids`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }

  getCurrencyIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-company-setting-currency/names-and-ids`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }
  getIndustriesIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-industries/name-and-id`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }
  getAllProductsIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-products/ids-and-names`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }
  getAllServicesIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-services/ids-and-names`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }

  getAllSalesGroupsIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-sales-group/ids-and-names`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }


  getAllOrgsIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/orgs/ids-and-names`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }


  getRegionsIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-regions/getRegionList`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }

  getCountriesIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-countries/names-and-ids`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }


  getPersonIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/persons/ids-and-names`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });
    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }

  getDealSourcesIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/administration-company-setting-deal-sources/getDealSourceList`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });


    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }

  getPersonsUsersByOrg(
    orgId: number | null,
    userId: number,
    salesRoleType: number
  ): Observable<any> {
    // build query string ?orgId=...&userId=...&salesRoleType=...
    let params = new HttpParams()
      .set('userId', Number(userId))
      .set('salesRoleType', salesRoleType);

    // adjust the URL path to match your backend route
    return this.http.get<any>(`${environment.apiUrl}/persons/getPersonListWithFiltration`, { params });
  }



  getOrganizationIdAndName(): Observable<GenericResponse> {
    const getUrl = `${environment.apiUrl}/orgs/ids-and-names`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
    });

    return this.http.get<GenericResponse>(getUrl, {
      headers
    });
  }

}