import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LayoutService } from '@/layout/service/layout.service';
import { GenericResponse } from '@/common/models/generic.response.model';

@Injectable({
    providedIn: 'root'
})
export class AddDealService {
    constructor(private http: HttpClient, private layoutService: LayoutService) { }

    getUserPipelines(): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/deals/getPipsBySalesUserAndManagerId?userId=${this.layoutService.getLoggedUser()?.userId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });

        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }

    getPipelineStages(pipelineId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/deals/getStagesOfPipeline?pipelineId=${pipelineId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });

        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }

    getUserSalesGroups(): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/deals/getGroupsAndPipIDByUser?userId=${this.layoutService.getLoggedUser()?.userId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });
        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }

    getSalesGroupUsers(salesGroupId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/administration-users/getAllUsersOfSalesGroup?SalesGroupId=${salesGroupId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });
        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }
    getPipelineSummaryByPipelineId(pipelineId: number, salesGroupId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/deals/getPipelineSummaries?pipelineId=${pipelineId}&salesGroupId=${salesGroupId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });

        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }

    getDealsUnderStage(salesGroupId: number, stageId: number, currencyId: number, userId?: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/deals/stage-deal-list?salesRole=${this.layoutService.getLoggedUser()?.userRoleTypeId}&userId=${userId || this.layoutService.getLoggedUser()?.userId}&groupId=${salesGroupId}&stageId=${stageId}&currencyId=${currencyId}&page=0&size=50&multiStatus=O&multiStatus=I`;

        // console.log(getUrl);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });

        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }

    getPersonsUnderOrganization(organizationId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/persons/getPersonListWithFiltration?userId=${this.layoutService.getLoggedUser()?.userId}&salesRoleType=${this.layoutService.getLoggedUser()?.userRoleTypeId}&orgId=${organizationId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });

        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }
    getProductsBySalesGroup(salesGroupId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/administration-products/getProductListWithFiltration?salesGroupId=${salesGroupId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });

        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }

    getServicesBySalesGroup(salesGroupId: number): Observable<GenericResponse> {
        const getUrl = `${environment.apiUrl}/administration-services/getServiceListWithFiltration?salesGroupId=${salesGroupId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`
        });

        return this.http.get<GenericResponse>(getUrl, {
            headers
        });
    }

    postDeal(deal: any): Observable<GenericResponse> {
        const postUrl = `${environment.apiUrl}/deals/create-all`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.layoutService.getLoggedUser()?.token}`,
            'X-User': this.layoutService.getLoggedUser()?.userId!
        });

        return this.http.post<GenericResponse>(postUrl, deal, {
            headers
        });
    }

}