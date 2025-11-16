// persons.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LayoutService } from '@/layout/service/layout.service';
import { GenericResponse } from '@/common/models/generic.response.model';
import { PersonDto } from './model/person-dto.model';
import { UpdatePersonDto } from './model/update-person-dto.model';

@Injectable({ providedIn: 'root' })
export class PersonsService {
  private baseUrl = `${environment.apiUrl}/persons`;


  // const salesRoleType = this.layout.loggedSalesRoleId;

  constructor(private http: HttpClient, private layout: LayoutService) { }

  private get writeHeaders(): HttpHeaders {
    // if your backend prefers username instead, switch to name/username
    return this.authHeaders.set('X-User', String(this.layout.getLoggedUser()?.userId || ''));
  }

  private get authHeaders(): HttpHeaders {
    const token = this.layout.getLoggedUser()?.token || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }

  // private get token(): string {
  //   return this.layout.getLoggedUser()?.token ?? '';
  // }

  private get userId(): string | null {
    return this.layout.getLoggedUser()?.userId ?? null;
  }

  private get salesRoleId(): number | null {
    const u: any = this.layout.getLoggedUser();
    return u?.userRoleTypeId ?? u?.salesRole?.id ?? null;
  }



  getTableDataRaw(id?: number | string, salesRoleType?: number | string): Observable<GenericResponse> {
    const url = `${this.baseUrl}/get-all`;
    const params = {
      id: String(id ?? this.userId ?? ''),
      salesRoleType: Number(salesRoleType ?? this.salesRoleId ?? ''),
    };
    console.log(params);
    return this.http.get<GenericResponse>(url, { headers: this.authHeaders, params });
  }

  // (Optional) Only if your backend also exposes /get-TableData without params
  // getTableDataRawSimple(): Observable<GenericResponse> {
  //   const url = `${this.baseUrl}/get-TableData`;
  //   return this.http.get<GenericResponse>(url, { headers: this.authHeaders });
  // }

  // hardCode
  deletePerson(id: number | string): Observable<unknown> {
    return this.http.request<GenericResponse>('DELETE', `${this.baseUrl}/delete-all`, {
      headers: this.writeHeaders, // includes Authorization + X-User
      body: [id]
    });
  }

  updatePerson(body: PersonDto[]): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(`${this.baseUrl}/update-all`, JSON.stringify(body), 
    { headers: this.writeHeaders })
  }

  createPerson(payload: PersonDto []): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.baseUrl}/create-all`, JSON.stringify(payload), {
      headers: this.writeHeaders,
    });
  }


// in your service.ts ---for practice
getUsers(): Observable<any> {
  return this.http.get('https://jsonplaceholder.typicode.com/users');
}


// there api for transfer contects

// 1- get group of users 
//deals/getGroupsAndPipIDByUser?userId=761

 getGroupOfUsers (userId?: number): Observable<GenericResponse> {
    const url = `${environment.apiUrl}/deals/getGroupsAndPipIDByUser`;
    // here i will ignore the Pipline ID
    const params = {
      userId: String(userId ?? this.userId ?? ''),
    };
    // console.log("test>",params);
    return this.http.get<GenericResponse>(url, { headers: this.authHeaders, params });
  }

// 2- get users of this group 
// administration-users/getAllUsersOfSalesGroup?SalesGroupId=282
getAllUsersOfSalesGroup (salesGroupId?: number): Observable<GenericResponse> {
    const url = `${environment.apiUrl}/administration-users/getAllUsersOfSalesGroup`;
    // here i will ignore the Pipline ID
    const params = {
      SalesGroupId: String(salesGroupId ?? 282),
    };
    console.log("SalesGroupId>",params);
    return this.http.get<GenericResponse>(url, { headers: this.authHeaders, params });
  }


// 3- get its person data withOut when is gerneral equal to N
//persons/getTransferContactsTableData?userId=761&salesRoleType=2
getTransferContactsData (userId?:number ,salesRoleType?: number): Observable<GenericResponse> {
    const url = `${environment.apiUrl}/persons/getTransferContactsTableData`;
    // here i will ignore the Pipline ID
   const params = {
      userId: String(userId ?? this.userId ?? ''),
      salesRoleType: Number(salesRoleType ?? this.salesRoleId ?? ''),
    };
    console.log("SalesGroupId>",params);
    return this.http.get<GenericResponse>(url, { headers: this.authHeaders, params });
  }







}
