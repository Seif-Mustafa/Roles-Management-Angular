import { Component, OnInit, signal } from '@angular/core';
import { User } from '../../model/user.model';
import { UsersService } from '../../users.service';
import { ToastService } from '@/common/services/toast.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast, ToastModule } from 'primeng/toast';
import { LoadingSpinnerComponent } from '@/common/components/loading-spinner.component';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';
import { LayoutService } from '@/layout/service/layout.service';
import { Tooltip } from 'primeng/tooltip';
import { Role } from '@/app-pages/roles/model/role.model';

@Component({
    selector: 'app-users-component',
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
        Tooltip
    ],
    templateUrl: './users-component.html',
    providers: [MessageService, ToastService, ConfirmationService]
})
export class UsersComponent implements OnInit {
    users = signal<User[]>([]);
    loading = signal<boolean>(true);
    tempUser: User | null = null;
    tempUserRoles = signal<Role[]>([]);
    showUserDialog: boolean = false;
    showUserRolesDialog: boolean = false;
    constructor(
        private usersService: UsersService,
        private toastService: ToastService,
        private confirmationService: ConfirmationService,
        private layoutService: LayoutService
    ) {}
    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading.set(true);
        this.usersService.getAllUsers().subscribe({
            next: (response) => {
                this.users.set(response.data as User[]);
                this.loading.set(false);
            },
            error: (error) => {
                this.toastService.error('common.error', 'users.failed_to_load_users');
                this.loading.set(false);
            }
        });
    }

    onAddUser() {
        this.showUserDialog = true;
        this.tempUser = {
            userId: undefined,
            appUsername: '',
            email: '',
            isActive: 'N',
            actionBy: this.layoutService.getLoggedUser()?.userId!
        };
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    viewUserRoles(user: User) {
        this.loading.set(true);
        this.usersService.getUserRoles(user.userId!).subscribe({
            next: (response) => {
                this.tempUserRoles.set(response.data.roles as Role[]);
                this.loading.set(false);
                this.showUserRolesDialog = true;
            },
            error: (error) => {
                this.toastService.error('common.error', 'users.failed_to_load_user_roles');
                this.loading.set(false);
            }
        });
    }

    editUser(user: User) {
        this.showUserDialog = true;
        this.tempUser = { ...user };
    }
    deleteUser(user: User) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + user.appUsername + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.usersService.deleteUser(user.userId!).subscribe({
                    next: (response) => {
                        this.toastService.success('common.success', 'users.user_deleted_successfully');
                        this.loadUsers();
                    },
                    error: (error) => {
                        this.toastService.error('common.error', error.message);
                    }
                });
            }
        });
    }

    hideUserDialog() {
        this.showUserDialog = false;
        this.tempUser = null;
    }

    hideUserRolesDialog() {
        this.showUserRolesDialog = false;
        this.tempUserRoles.set([]);
    }
    saveUser() {
        if (!this.validateUser()) {
            return;
        }
        if (this.tempUser?.userId === undefined) {
            this.usersService.createUser(this.tempUser!).subscribe({
                next: (response) => {
                    this.toastService.success('common.success', 'users.user_created_successfully');
                    this.loadUsers();
                    this.hideUserDialog();
                },
                error: (error) => {
                    this.toastService.error('common.error', error.message);
                }
            });
        } else {
            this.usersService.updateUser(this.tempUser).subscribe({
                next: (response) => {
                    this.toastService.success('common.success', 'users.user_updated_successfully');
                    this.loadUsers();
                    this.hideUserDialog();
                },
                error: (error) => {
                    this.toastService.error('common.error', error.message);
                }
            });
        }
    }

    validateUser(): boolean {
        if (this.tempUser?.appUsername.length === 0) {
            this.toastService.error('common.error', 'users.username_is_required');
            return false;
        } else if (this.tempUser?.email.length === 0) {
            this.toastService.error('common.error', 'users.email_is_required');
            return false;
        }
        return true;
    }
}
