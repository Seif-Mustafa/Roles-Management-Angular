import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from '@/layout/service/auth.guard';
import { Login } from '@/login/login-component/login-component';
import { ActivitiesComponent } from '@/crm-pages/activities/activities-component/activities-component';

export const templateRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: 'app', loadChildren: () => import('./app/routes/app.routes') },
            { path: 'dashboard', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ],
        canActivate: [AuthGuard]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'login', component: Login },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
