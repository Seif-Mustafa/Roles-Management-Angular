import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { ToastService } from '@/common/services/toast.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { Table, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';

import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { UserDetailsService } from '../user-details.service';
import { UserDetailsResponse } from '../model/user-details.response.model';
import { UserDetailsRequest } from '../model/user-details.request.model';
import { LayoutService } from '@/layout/service/layout.service';
import { ToggleSwitch } from "primeng/toggleswitch";

@Component({
    selector: 'app-role-details-component',
    imports: [CommonModule, ToastModule, InputTextModule, LoadingSpinnerComponent, Toolbar, Button, TranslateModule, TableModule, IconField, InputIcon, Tag, CheckboxModule, FormsModule, ToggleSwitch],
    templateUrl: './user-details-component.html',
    providers: [ToastService]
})
export class UserDetailsComponent implements OnInit {
    loading = signal<boolean>(true);

    private route = inject(ActivatedRoute);

    userDetails: UserDetailsResponse = {} as UserDetailsResponse;

    constructor(
        private userDetailsService: UserDetailsService,
        private toastService: ToastService,
        private layoutService: LayoutService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loading.set(true);
        this.route.params.subscribe((params) => {
            const userId = params['id'];
            this.userDetailsService.getUserDetails(Number(userId)).subscribe({
                next: (response) => {
                    this.userDetails = response.data as UserDetailsResponse;
                    this.loading.set(false);
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

    saveUserDetails() {
        const userDetailsRequest: UserDetailsRequest = this.mapToUserDetailsRequest(this.userDetails);


        this.userDetailsService.saveUserDetails(userDetailsRequest).subscribe({
            next: (response) => {
                this.userDetails = response.data as UserDetailsResponse;
                this.loading.set(false);
                this.toastService.success('common.success', 'common.saved_successfully');
            },
            error: (error) => {
                this.toastService.error('common.error', 'common.failed_to_save_changes');
                this.loading.set(false);
            }
        });
    }

    deleteUser() {}

    backToUsersList() {
        this.router.navigate(['/app/users']);
    }

    mapToUserDetailsRequest(userDetailsResponse: UserDetailsResponse): UserDetailsRequest {
        return {
            userId: userDetailsResponse.userId,
            username: userDetailsResponse.username,
            email: userDetailsResponse.email,
            isActive: userDetailsResponse.isActive,
            modifiedBy:this.layoutService.getLoggedUser()?.userId!,
            roles: userDetailsResponse.roles.map((role) => ({
                roleId: role.roleId,
                isSelected: role.isSelected
            }))
        };
    }
}
