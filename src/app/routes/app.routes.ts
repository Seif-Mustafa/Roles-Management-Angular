import { RoleDetailsComponent } from '@/app-pages/role-details/role-details-component/role-details-component';
import { RolesComponent } from '@/app-pages/roles/roles-component/roles-component';
import { UsersComponent } from '@/app-pages/users/page/users-component/users-component';
import { Routes } from '@angular/router';

export default [
    { path: 'users', data: { breadcrumb: 'Users' }, component: UsersComponent },
    { path: 'roles', data: { breadcrumb: 'Roles' }, component: RolesComponent },
    { path: 'roles/role-details/:id', data: { breadcrumb: 'Role Details' }, component: RoleDetailsComponent }
] as Routes;
