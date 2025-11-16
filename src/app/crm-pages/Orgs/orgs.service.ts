// ===== 1) Imports =====
// اكتب هنا: استيراد HttpClient و HttpHeaders من @angular/common/http
// اكتب هنا: استيراد Observable من rxjs و operator: map
// اكتب هنا: استيراد environment من 'src/environments/environment'
// اكتب هنا: استيراد GenericResponse من الموديل عندك (المسار بتاع مشروعك)
// اكتب هنا: استيراد LayoutService (لو هتجيب التوكن منه)
// اكتب هنا: تعريف/استيراد الواجهة OrgDataTable (id, organizationName, industryName, countryName, regionName, telephone1, telephone2)

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

import { GenericResponse } from '@/common/models/generic.response.model';
import { LayoutService } from '@/layout/service/layout.service';
import { OrgDataTable } from './model/org-data-table.type=model';
import { CreateOrgDto } from './model/create-org-dto.model';
import { Header } from 'primeng/api';
import { UpdateOrgDto } from './model/update-org-dto.model';


@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  // ===== 2) Constructor & DI =====
  // اكتب هنا: constructor لحقن HttpClient
  // ولو هتستخدم التوكن من LayoutService: احقنه برضه
  constructor(private http: HttpClient, private layout: LayoutService) { }

  // ===== 3) Base URL =====
  // قاعدة الخدمة الأساسية الخاصة بالـ Organizations
  private baseUrl = `${environment.apiUrl}/orgs`;

  // ===== 4) Auth Headers =====
  // getter بيرجع Content-Type + Authorization Bearer من LayoutService (لو متاح)
  private get authHeaders(): HttpHeaders {
    const token = this.layout.getLoggedUser()?.token || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // هيدر للعمليات الكتابية يضيف X-User (اختياري حسب الباك إند)
  private get writeHeaders(): HttpHeaders {
    return this.authHeaders.set('X-User', String(this.layout.getLoggedUser()?.userId || ''));
  }

  // ===== 5) Endpoints =====

  /**
   * [RAW] استرجاع البيانات كما هي من الـAPI
   * GET /orgs/get-TableData  ->  GenericResponse { status, message, data }
   */
  getTableDataRaw(): Observable<GenericResponse> {
    const url = `${this.baseUrl}/get-TableData`;
    return this.http.get<GenericResponse>(url, { headers: this.authHeaders });
  }

  deleteOrg(id: number): Observable<GenericResponse> {
    const params = new HttpParams().set('id', String(id));
    return this.http.delete<GenericResponse>(
      `${this.baseUrl}/delete-byId`,
      { headers: this.writeHeaders, params }
    );
  }


  searchOrgs(filters: any) {
    let params = new HttpParams();
    Object.keys(filters).forEach((k) => {
      const v = filters[k];
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        params = params.set(k, String(v));
      }
    });

    const url = `${this.baseUrl}/search`;
    return this.http.get<GenericResponse>(url, {
      headers: this.authHeaders,   // ✅ send Bearer token
      params
    });
  }

  createOrg(payload: CreateOrgDto[]): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.baseUrl}/create-all`, payload, { headers: this.authHeaders })
    // JSON.stringify(payload)
  }

  updateOrg(payload: UpdateOrgDto[]): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(
      `${this.baseUrl}/update-all`,
      JSON.stringify(payload),
      { headers: this.writeHeaders }  // includes X-User + Bearer
    );
  }






}
