import { RolesComponent } from '@/app-pages/roles/roles-component/roles-component';
import { UsersComponent } from '@/app-pages/users/page/users-component/users-component';
import { Routes } from '@angular/router';

export default [
    { path: 'users', data: { breadcrumb: 'Users' }, component: UsersComponent },
    { path: 'roles', data: { breadcrumb: 'Roles' }, component: RolesComponent }
] as Routes;
