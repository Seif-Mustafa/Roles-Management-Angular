import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { ToastService } from '@/common/services/toast.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { RoleDetailsService } from '../role-details.service';
import { RoleDetailsResponse } from '../model/role-details.response.model';
import { Table, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';

import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { RoleDetailsRequest } from '../model/role-details.request.model';

@Component({
    selector: 'app-role-details-component',
    imports: [CommonModule, ToastModule, InputTextModule, LoadingSpinnerComponent, Toolbar, Button, TranslateModule, TableModule, IconField, InputIcon, Tag, CheckboxModule, FormsModule],
    templateUrl: './role-details-component.html',
    providers: [ToastService]
})
export class RoleDetailsComponent implements OnInit {
    loading = signal<boolean>(true);

    private route = inject(ActivatedRoute);

    roleDetails: RoleDetailsResponse = {} as RoleDetailsResponse;

    constructor(
        private roleDetailsService: RoleDetailsService,
        private toastService: ToastService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loading.set(true);
        this.route.params.subscribe((params) => {
            const roleId = params['id'];
            this.roleDetailsService.getRoleDetails(Number(roleId)).subscribe({
                next: (response) => {
                    this.roleDetails = response.data as RoleDetailsResponse;
                    this.loading.set(false);
                    // console.log(this.roleDetails);
                },
                error: (error) => {
                    this.toastService.error('common.error', 'common.failed_to_load_data');
                    this.loading.set(false);
                }
            });
        });
        this.loading.set(false);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    saveRoleDetails() {
        const roleDetailsRequest: RoleDetailsRequest = this.mapToRoleDetailsRequest(this.roleDetails);

        console.log(roleDetailsRequest);

        this.roleDetailsService.saveRoleDetails(roleDetailsRequest).subscribe({
            next: (response) => {
                this.roleDetails = response.data as RoleDetailsResponse;
                this.loading.set(false);
                this.toastService.success('common.success', 'common.saved_successfully');
            },
            error: (error) => {
                this.toastService.error('common.error', 'common.failed_to_save_changes');
                this.loading.set(false);
            }
        });
    }

    deleteRole() {}

    backToRolesList() {
        this.router.navigate(['/app/roles']);
    }

    mapToRoleDetailsRequest(roleDetailsResponse: RoleDetailsResponse): RoleDetailsRequest {
        return {
            roleId: roleDetailsResponse.roleId,
            roleName: roleDetailsResponse.roleName,
            roleDescription: roleDetailsResponse.roleDescription,
            isActive: roleDetailsResponse.isActive,
            pages: roleDetailsResponse.pages.map((page) => ({
                pageId: page.pageId,
                isSelected: page.isSelected
            })),
            buttons: roleDetailsResponse.buttons.map((button) => ({
                buttonId: button.buttonId,
                isSelected: button.isSelected
            })),
            users: roleDetailsResponse.users.map((user) => ({
                userId: user.userId,
                isSelected: user.isSelected
            }))
        };
    }
}
