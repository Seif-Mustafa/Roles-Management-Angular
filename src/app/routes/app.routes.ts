import { RoleDetailsComponent } from '@/app-pages/role-details/role-details-component/role-details-component';
import { RolesComponent } from '@/app-pages/roles/roles-component/roles-component';
import { UserDetailsComponent } from '@/app-pages/user-details/user-details-component/user-details-component';
import { UsersComponent } from '@/app-pages/users/users-component/users-component';
import { Routes } from '@angular/router';

export default [
    { path: 'users', data: { breadcrumb: 'Users' }, component: UsersComponent },
    { path: 'roles', data: { breadcrumb: 'Roles' }, component: RolesComponent },
    { path: 'roles/role-details/:id', data: { breadcrumb: [{label:'Roles', routerLink:'/app/roles'},{label:'Role Details', routerLink:'/roles/role-details/:id'}] }, component: RoleDetailsComponent },
    { path: 'users/user-details/:id', data: { breadcrumb: [{  label:'Users', routerLink:'/app/users'},{label:'User Details', routerLink:''}] }, component: UserDetailsComponent }
] as Routes;
