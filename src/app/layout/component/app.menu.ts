// app.menu.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../service/layout.service';

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
        private layoutService: LayoutService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit() {
        // Initialize translations
        // if (isPlatformBrowser(this.platformId)) {
        //     const browserLang = this.translate.getBrowserLang();
        //     this.translate.use(browserLang && ['en', 'es', 'fr', 'ar'].includes(browserLang) ? browserLang : 'en');
        // }

        this.buildMenu();
        // Rebuild menu when language changes
        this.translate.onLangChange.subscribe(() => {
            this.buildMenu();
        });
    }

    buildMenu() {
        this.model = [
            {
                resourceCode: 'APP_PAGES_GROUP',
                label: this.translate.instant('app_pages.title'),
                icon: 'pi pi-fw pi-shield',
                items: [
                    { resourceCode: 'APP_USERS_VIEW', label: this.translate.instant('app_pages.users'), icon: 'pi pi-fw pi-users', routerLink: ['/app/users'] },
                    { resourceCode: 'APP_ROLES_VIEW', label: this.translate.instant('app_pages.roles'), icon: 'pi pi-fw pi-crown', routerLink: ['/app/roles'] }
                ]
            },
            {
                resourceCode: 'HOME_GROUP',
                label: this.translate.instant('home.title'),
                items: [
                    {
                        resourceCode: 'DASHBOARD_VIEW',
                        label: this.translate.instant('home.dashboard'),
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/dashboard']
                    }
                ]
            },
            {
                resourceCode: 'UI_GROUP',
                label: this.translate.instant('ui_components.title'),
                items: [
                    { resourceCode: 'UI_FORMLAYOUT_VIEW', label: this.translate.instant('ui_components.form_layout'), icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { resourceCode: 'UI_INPUT_VIEW', label: this.translate.instant('ui_components.input'), icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { resourceCode: 'UI_BUTTON_VIEW', label: this.translate.instant('ui_components.button'), icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { resourceCode: 'UI_TABLE_VIEW', label: this.translate.instant('ui_components.table'), icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { resourceCode: 'UI_LIST_VIEW', label: this.translate.instant('ui_components.list'), icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { resourceCode: 'UI_TREE_VIEW', label: this.translate.instant('ui_components.tree'), icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { resourceCode: 'UI_PANEL_VIEW', label: this.translate.instant('ui_components.panel'), icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { resourceCode: 'UI_OVERLAY_VIEW', label: this.translate.instant('ui_components.overlay'), icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { resourceCode: 'UI_MEDIA_VIEW', label: this.translate.instant('ui_components.media'), icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { resourceCode: 'UI_MENU_VIEW', label: this.translate.instant('ui_components.menu'), icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { resourceCode: 'UI_MESSAGE_VIEW', label: this.translate.instant('ui_components.message'), icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { resourceCode: 'UI_FILE_VIEW', label: this.translate.instant('ui_components.file'), icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { resourceCode: 'UI_CHART_VIEW', label: this.translate.instant('ui_components.chart'), icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { resourceCode: 'UI_TIMELINE_VIEW', label: this.translate.instant('ui_components.timeline'), icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { resourceCode: 'UI_MISC_VIEW', label: this.translate.instant('ui_components.misc'), icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            },
            {
                resourceCode: 'PAGES_GROUP',
                label: this.translate.instant('pages.title'),
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    { resourceCode: 'PAGES_LANDING_VIEW', label: this.translate.instant('pages.landing'), icon: 'pi pi-fw pi-globe', routerLink: ['/landing'] },
                    {
                        resourceCode: 'AUTHENTICATION_GROUP',
                        label: this.translate.instant('pages.auth'),
                        icon: 'pi pi-fw pi-user',
                        items: [
                            { resourceCode: 'PAGES_LOGIN_VIEW', label: this.translate.instant('pages.login'), icon: 'pi pi-fw pi-sign-in', routerLink: ['/login'] },
                            { resourceCode: 'PAGES_ERROR_VIEW', label: this.translate.instant('pages.error'), icon: 'pi pi-fw pi-times-circle', routerLink: ['/auth/error'] },
                            { resourceCode: 'PAGES_ACCESS_VIEW', label: this.translate.instant('pages.access_denied'), icon: 'pi pi-fw pi-lock', routerLink: ['/auth/access'] }
                        ]
                    },
                    { resourceCode: 'PAGES_CRUD_VIEW', label: this.translate.instant('pages.crud'), icon: 'pi pi-fw pi-pencil', routerLink: ['/pages/crud'] },
                    { resourceCode: 'PAGES_NOTFOUND_VIEW', label: this.translate.instant('pages.not_found'), icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/pages/notfound'] },
                    { resourceCode: 'PAGES_EMPTY_VIEW', label: this.translate.instant('pages.empty'), icon: 'pi pi-fw pi-circle-off', routerLink: ['/pages/empty'] }
                ]
            },
            {
                resourceCode: 'HIERARCHY_GROUP',
                label: this.translate.instant('hierarchy.title'),
                items: [
                    {
                        resourceCode: 'HIERARCHY_LEVEL_ONE_SUBMENU_VIEW',
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
                resourceCode: 'GET_STARTED_GROUP',
                label: this.translate.instant('get_started.title'),
                items: [
                    { resourceCode: 'DOCS_VIEW', label: this.translate.instant('get_started.documentation'), icon: 'pi pi-fw pi-book', routerLink: ['/documentation'] },
                    { resourceCode: 'GET_STARTED_VIEW', label: this.translate.instant('get_started.view_source'), icon: 'pi pi-fw pi-github', url: 'https://github.com/primefaces/sakai-ng', target: '_blank' }
                ]
            }
        ];

        const userAllowedPages = new Set(this.layoutService.getLoggedUser()?.pages.map((page) => page.resourceCode));

        this.model = this.filterMenuByPermissions(this.model, userAllowedPages);
    }

    filterMenuByPermissions(items: MenuItem[], allowed?: Set<string>): MenuItem[] {
        let filteredMenuItems: MenuItem[] = [];

        for (const item of items) {
            const hasResource = item['resourceCode'] && allowed?.has(item['resourceCode']);

            let filteredChildren: MenuItem[] = [];
            if (item.items && item.items.length > 0) {
                filteredChildren = this.filterMenuByPermissions(item.items, allowed);
            }
            // Keep this menu item if:
            // 1. It is allowed OR
            // 2. It has allowed children
            // GROUP
            if (filteredChildren.length > 0) {
                filteredMenuItems.push({
                    ...item,
                    items: filteredChildren
                });
            } else if (hasResource) {
                filteredMenuItems.push(item);
            }
        }

        return filteredMenuItems;
    }

    // filterMenu(items: any[], allowed: Set<string>) {
    //     const filtered = [];

    //     for (const item of items) {
    //         const hasResource = item.resourceCode && allowed.has(item.resourceCode);

    //         let filteredChildren = [];
    //         if (item.items && item.items.length > 0) {
    //             filteredChildren = this.filterMenu(item.items, allowed);
    //         }

    //         // Keep this menu item if:
    //         // 1. It is allowed OR
    //         // 2. It has allowed children
    //         if (hasResource || filteredChildren.length > 0) {
    //             filtered.push({
    //                 ...item,
    //                 items: filteredChildren
    //             });
    //         }
    //     }

    //     return filtered;
    // }
}
