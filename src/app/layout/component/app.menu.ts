// app.menu.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(
        private translate: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit() {
        // Initialize translations
        // if (isPlatformBrowser(this.platformId)) {
        //     const browserLang = this.translate.getBrowserLang();
        //     this.translate.use(browserLang && ['en', 'es', 'fr', 'ar'].includes(browserLang) ? browserLang : 'en');
        // }

        this.buildMenu();

        if (environment.apiUrl.includes('crmangular')) {
            this.model = this.model.splice(0, 2); // Keep only the first 2 main menu item
        }

        // Rebuild menu when language changes
        this.translate.onLangChange.subscribe(() => {
            this.buildMenu();
        });
    }

    buildMenu() {
        this.model = [
            {
                label: this.translate.instant('app_pages.title'),
                icon: 'pi pi-fw pi-shield',
                items: [
                    {
                        label: this.translate.instant('app_pages.users'),
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/app/users']
                    },
                    {
                        label: this.translate.instant('app_pages.roles'),
                        icon: 'pi pi-fw pi-crown',
                        routerLink: ['/app/roles']
                    }
                ]
            },
            {
                label: this.translate.instant('home.title'),
                items: [{ label: this.translate.instant('home.dashboard'), icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }]
            },
            {
                label: this.translate.instant('ui_components.title'),
                items: [
                    { label: this.translate.instant('ui_components.form_layout'), icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: this.translate.instant('ui_components.input'), icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { label: this.translate.instant('ui_components.button'), icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { label: this.translate.instant('ui_components.table'), icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: this.translate.instant('ui_components.list'), icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: this.translate.instant('ui_components.tree'), icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: this.translate.instant('ui_components.panel'), icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: this.translate.instant('ui_components.overlay'), icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: this.translate.instant('ui_components.media'), icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: this.translate.instant('ui_components.menu'), icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { label: this.translate.instant('ui_components.message'), icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: this.translate.instant('ui_components.file'), icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: this.translate.instant('ui_components.chart'), icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: this.translate.instant('ui_components.timeline'), icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { label: this.translate.instant('ui_components.misc'), icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            },
            {
                label: this.translate.instant('pages.title'),
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: this.translate.instant('pages.landing'),
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: this.translate.instant('pages.auth'),
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: this.translate.instant('pages.login'),
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/login']
                            },
                            {
                                label: this.translate.instant('pages.error'),
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: this.translate.instant('pages.access_denied'),
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    {
                        label: this.translate.instant('pages.crud'),
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/pages/crud']
                    },
                    {
                        label: this.translate.instant('pages.not_found'),
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/pages/notfound']
                    },
                    {
                        label: this.translate.instant('pages.empty'),
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/pages/empty']
                    }
                ]
            },
            {
                label: this.translate.instant('hierarchy.title'),
                items: [
                    {
                        label: this.translate.instant('hierarchy.submenu_1'),
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: this.translate.instant('hierarchy.submenu_1_1'),
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: this.translate.instant('hierarchy.submenu_1_1_1'), icon: 'pi pi-fw pi-bookmark' },
                                    { label: this.translate.instant('hierarchy.submenu_1_1_2'), icon: 'pi pi-fw pi-bookmark' },
                                    { label: this.translate.instant('hierarchy.submenu_1_1_3'), icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: this.translate.instant('hierarchy.submenu_1_2'),
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: this.translate.instant('hierarchy.submenu_1_2_1'), icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    },
                    {
                        label: this.translate.instant('hierarchy.submenu_2'),
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: this.translate.instant('hierarchy.submenu_2_1'),
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: this.translate.instant('hierarchy.submenu_2_1_1'), icon: 'pi pi-fw pi-bookmark' },
                                    { label: this.translate.instant('hierarchy.submenu_2_1_2'), icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: this.translate.instant('hierarchy.submenu_2_2'),
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: this.translate.instant('hierarchy.submenu_2_2_1'), icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },
            {
                label: this.translate.instant('get_started.title'),
                items: [
                    {
                        label: this.translate.instant('get_started.documentation'),
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/documentation']
                    },
                    {
                        label: this.translate.instant('get_started.view_source'),
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/primefaces/sakai-ng',
                        target: '_blank'
                    }
                ]
            }
        ];
    }
}
