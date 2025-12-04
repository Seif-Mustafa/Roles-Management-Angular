import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { Role } from '../model/role.model';
import { RolesService } from '../roles.service';
import { ToastService } from '@/common/services/toast.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LayoutService } from '@/layout/service/layout.service';
import { TextareaModule } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { RoleUser } from '../model/role-user.model';
import { Router } from '@angular/router';
import { GenericResponse } from '@/common/models/generic.response.model';

@Component({
    selector: 'app-roles-component',
    imports: [
        CommonModule,
        ToastModule,
        LoadingSpinnerComponent,
        ButtonModule,
        TranslateModule,
        TableModule,
        IconFieldModule,
        InputIconModule,
        ToolbarModule,
        TagModule,
        ConfirmDialogModule,
        DialogModule,
        FormsModule,
        InputTextModule,
        ToggleSwitchModule,
        PasswordModule,
        TextareaModule,
        Tooltip
    ],
    templateUrl: './roles-component.html',
    providers: [MessageService, ToastService, ConfirmationService]
})
export class RolesComponent implements OnInit {
    roles = signal<Role[]>([]);
    loading = signal<boolean>(true);
    tempRole: Role | null = null;
    tempRoleUsers = signal<RoleUser[]>([]);
    showRoleDialog: boolean = false;
    showRoleUsersDialog: boolean = false;

    globalFilterValue = signal<string>('');
    @ViewChild('dt') dt: Table | undefined;
    tableRowsCount = signal<number>(5);
    totalRecords = signal<number>(0);

    sortField: string = 'roleId';
    sortOrder: number = 1;
    page: number = 0;
    size: number = 5;

    constructor(
        private rolesService: RolesService,
        private toastService: ToastService,
        private confirmationService: ConfirmationService,
        private layoutService: LayoutService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadRoles();
    }

    rolesTableLoading(event: TableLazyLoadEvent) {
        this.loading.set(true);
        this.page = (event.first ?? 0) / (event.rows ?? 5);
        this.size = event.rows ?? 5;

        // Sorting
        this.sortField = Array.isArray(event.sortField) ? event.sortField[0] : (event.sortField ?? 'roleId');
        this.sortOrder = event.sortOrder ?? 1;
        const sort = `${this.sortField},${this.sortOrder === 1?'asc':'desc'}`;
        let search = '';
        if (event.filters && event.filters['global']) {
            const filterValue = event.filters['global'];
            if (!Array.isArray(filterValue)) {
                search = filterValue.value ?? '';
            }
        }
        this.loadRoles(search, sort);
    }

    loadRoles(filters?: string, sort: string = 'roleId,asc'): void {
        this.rolesService.getAllRolesPaginationFiltering(this.page, this.size, filters, sort).subscribe({
            next: (response: GenericResponse) => {
                const pageData = response.data;
                this.roles.set(pageData.content);
                this.totalRecords.set(pageData.page.totalElements);
                this.tableRowsCount.set(this.size);
                this.loading.set(false);
            },
            error: (error) => {
                this.toastService.error('common.error', 'roles.failed_to_load_roles');
                this.loading.set(false);
            }
        });
    }

    onAddRole() {
        this.showRoleDialog = true;
        this.tempRole = {
            roleId: undefined,
            roleName: '',
            description: '',
            isActive: 'N',
            actionBy: this.layoutService.getLoggedUser()?.userId!
        };
    }

    onGlobalFilter(table: Table, event: any) {
        const value = event.target.value;
        this.globalFilterValue.set(value);
        table.filterGlobal(value, 'contains');
    }

    viewRoleUsers(role: Role) {
        this.loading.set(true);
        this.rolesService.getRoleUsers(role.roleId!).subscribe({
            next: (response) => {
                this.tempRoleUsers.set(response.data.users as RoleUser[]);
                this.loading.set(false);
                this.showRoleUsersDialog = true;
            },
            error: (error) => {
                this.toastService.error('common.error', 'roles.failed_to_load_role_users');
                this.loading.set(false);
            }
        });
    }

    editRole(role: Role) {
        this.showRoleDialog = true;
        this.tempRole = { ...role };
    }

    deleteRole(role: Role) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delte ' + role.roleName + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.rolesService.deleteRole(role.roleId!).subscribe({
                    next: (response) => {
                        this.toastService.success('common.success', 'roles.role_deleted_successfully');
                        this.loadRoles();
                    },
                    error: (error) => {
                        this.toastService.error('common.error', error.message);
                    }
                });
            }
        });
    }
    hideRoleDialog() {
        this.showRoleDialog = false;
        this.tempRole = null;
    }

    hideRoleUsersDialog() {
        this.showRoleUsersDialog = false;
        this.tempRoleUsers.set([]);
    }

    saveRole() {
        if (!this.validateRole()) {
            return;
        }

        if (this.tempRole?.roleId === undefined) {
            this.rolesService.createRole(this.tempRole!).subscribe({
                next: (response) => {
                    this.toastService.success('common.success', 'roles.role_created_successfully');
                    this.loadRoles();
                    this.hideRoleDialog();
                },
                error: (error) => {
                    this.toastService.error('common.error', error.message);
                }
            });
        } else {
            this.rolesService.updateRole(this.tempRole).subscribe({
                next: (response) => {
                    this.toastService.success('common.success', 'roles.role_updated_successfully');
                    this.loadRoles();
                    this.hideRoleDialog();
                },
                error: (error) => {
                    this.toastService.error('common.error', error.message);
                }
            });
        }
    }

    navigateToRoleDetails(role: Role) {
        this.router.navigate([`/app/roles/role-details/${role.roleId}`]);
    }
    validateRole(): boolean {
        if (this.tempRole?.roleName.length === 0) {
            this.toastService.error('common.error', 'roles.role_name_required');
            return false;
        }

        return true;
    }
}
