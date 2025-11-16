import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Table, TableModule } from 'primeng/table';
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
import { User } from '@/app-pages/users/model/user.model';
import { Tooltip } from 'primeng/tooltip';
import { RoleUser } from '../model/role-user.model';

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

    constructor(
        private rolesService: RolesService,
        private toastService: ToastService,
        private confirmationService: ConfirmationService,
        private layoutService: LayoutService
    ) {}

    ngOnInit() {
        this.loadRoles();
    }

    loadRoles() {
        this.loading.set(true);
        this.rolesService.getAllRoles().subscribe({
            next: (response) => {
                this.roles.set(response.data as Role[]);
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

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
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

    validateRole(): boolean {
        if (this.tempRole?.roleName.length === 0) {
            this.toastService.error('common.error', 'roles.role_name_required');
            return false;
        }

        return true;
    }
}
