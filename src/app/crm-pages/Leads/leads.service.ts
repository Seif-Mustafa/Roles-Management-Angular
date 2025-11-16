import { GenericResponse } from '@/common/models/generic.response.model';
import { LayoutService } from '@/layout/service/layout.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateLeadDto } from './model/create-lead-dto.model';
import { UpdateLeadDto } from './model/update-lead-dto.model';
import { NoteCardCreateDto } from './model/note-card-create-dto.model';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {

  private baseUrl = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient, private layout: LayoutService) { }

  private get writeHeaders(): HttpHeaders {
    // if your backend prefers username instead, switch to name/username
    return this.authHeaders.set('X-User', String(this.layout.getLoggedUser()?.username || ''));
  }

  private get authHeaders(): HttpHeaders {
    const token = this.layout.getLoggedUser()?.token || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }

  private get userId(): string | null {
    return this.layout.getLoggedUser()?.userId ?? null;
  }

  private get salesRoleId(): number | null {
    const u: any = this.layout.getLoggedUser();
    return u?.userRoleTypeId ?? u?.salesRole?.id ?? null;
  }

  createLeed(payload: CreateLeadDto[]): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.baseUrl}/create-all`, JSON.stringify(payload), {
      headers: this.writeHeaders,
    });
  }

  getLeadsRows(paramsIn: {
    userId: number | string;
    view?: 'A' | 'O' | 'P' | 'NON' | 'ARC';
    leadTitle?: string | null;
    leadSource?: string | null;
    personName?: string | null;
    orgName?: string | null;
  }): Observable<GenericResponse> {
    const url = `${this.baseUrl}/search-by`;

    let params = new HttpParams().set('userId', String(paramsIn.userId));
    const add = (k: string, v?: string | null) => {
      if (v != null && String(v).trim() !== '') params = params.set(k, String(v).trim());
    };

    add('view', paramsIn.view?.toUpperCase());
    add('leadTitle', paramsIn.leadTitle);
    add('leadSource', paramsIn.leadSource);
    add('personName', paramsIn.personName);
    add('orgName', paramsIn.orgName);

    return this.http.get<GenericResponse>(url, { headers: this.authHeaders, params });
  }

  deleteLead(leadIds: (number | string)[]): Observable<GenericResponse> {
    const url = `${this.baseUrl}/delete-all`;
    return this.http.request<GenericResponse>('DELETE', url, {
      headers: this.writeHeaders,
      body: { leadIds }
    });
  }

  updateLead(body: UpdateLeadDto[]): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(`${this.baseUrl}/update-all`, body,
      { headers: this.writeHeaders })
  }


  // ... other methods are fine ...

  getNotesByLeadId(leadId: number | string): Observable<GenericResponse> {
    // 1. Create params variable
    let httpParams = new HttpParams().set('id', String(leadId));

    return this.http.get<GenericResponse>(`${this.baseUrl}/getLeadNotes`, {
      headers: this.authHeaders,
      params: httpParams // 2. Use the 'params' (plural) property
    });
  }

  getActivitiesByLeadId(leadId: number | string): Observable<GenericResponse> {
    // 1. Create params variable
    let httpParams = new HttpParams().set('id', String(leadId));

    // 2. This must be http.get, not http.put
    return this.http.get<GenericResponse>(`${this.baseUrl}/getLeadActivities`, {
      headers: this.authHeaders,
      params: httpParams // 3. Use the 'params' (plural) property
    });
  }

  // create note
  createNote(payload: NoteCardCreateDto[]): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${environment.apiUrl}/notes/create-all`, JSON.stringify(payload), {
      headers: this.writeHeaders,
    });
  }


  getActiveUsers() {
  const url = `${environment.apiUrl}/administration-users/getCurrentUserNames`;
  return this.http.get(url, {
    headers: this.authHeaders// نفس الهيدر اللي عندك عشان Authorization
  });
}












}
