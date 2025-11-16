import { Routes } from '@angular/router';
import { Access } from './access';
import { Error } from './error';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
] as Routes;
