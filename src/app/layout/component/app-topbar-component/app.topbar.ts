import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from '../app.configurator';
import { LayoutService } from '../../service/layout.service';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, FormsModule, MenuModule],
    templateUrl: 'app.topbar.html'
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    currentLang: string;

    constructor(
        public layoutService: LayoutService,
        private translate: TranslateService,
        private router: Router
    ) {
        this.currentLang = this.translate.currentLang;

        this.defaultUserPreferences();
    }

    defaultUserPreferences(): void {
        const storedTheme = localStorage.getItem('appTheme');
        const primaryColor = localStorage.getItem('primaryColor');
        const surfaceColor = localStorage.getItem('surfaceColor');
        const appPreset = localStorage.getItem('appPreset');
        const menuMode = localStorage.getItem('menuMode');
        if (primaryColor) {
            this.layoutService.layoutConfig.update((state) => ({ ...state, primary: primaryColor }));
        }
        if (surfaceColor) {
            this.layoutService.layoutConfig.update((state) => ({ ...state, surface: surfaceColor }));
        }
        if (appPreset) {
            this.layoutService.layoutConfig.update((state) => ({ ...state, preset: appPreset }));
        }
        if (menuMode) {
            this.layoutService.layoutConfig.update((state) => ({ ...state, menuMode: menuMode }));
        }
        if (storedTheme) {
            const isDark = JSON.parse(storedTheme);
            this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: isDark }));
        }
    }

    profileMenuItems: MenuItem[] = [];

    ngOnInit() {
        this.profileMenuItems = [
            {
                label: 'Profile',
                icon: 'pi pi-user',
                routerLink: ['/profile']
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                routerLink: ['/settings']
            },
            { separator: true },
            {
                label: 'Logout',
                icon: 'pi pi-power-off',
                command: () => {
                    this.logout();
                }
            }
        ];
    }
    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => {
            const newDarkTheme = !state.darkTheme;
            localStorage.setItem('appTheme', JSON.stringify(newDarkTheme));
            return {
                ...state,
                darkTheme: newDarkTheme
            };
        });
    }
    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'ar' : 'en';
        this.currentLang = newLang;
        this.translate.use(newLang);
        localStorage.setItem('appLanguage', newLang);
    }

    logout() {
        localStorage.removeItem('loggedUser');
        this.router.navigate(['login']);
    }
}
