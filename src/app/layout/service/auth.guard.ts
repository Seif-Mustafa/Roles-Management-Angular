import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from './layout.service';
import { CanActivate } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private layoutService: LayoutService,
        private router: Router
    ) {}

    canActivate() {
        // Check if user is authenticated using the logged user information
        if (this.layoutService.isAuthenticated()) {
            return true;
        } else {
            // Redirect to login page
            this.router.navigate(['/login']);
            return false;
        }
    }
}