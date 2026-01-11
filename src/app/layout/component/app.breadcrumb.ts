import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-breadcrumb',
    standalone: true,
    imports: [CommonModule, RouterModule, BreadcrumbModule],
    template: ` <div class="layout-breadcrumb rounded-xl overflow-hidden mb-3">
        <p-breadcrumb [model]="(breadcrumbs$ | async) ?? []" [home]="home"></p-breadcrumb>
    </div>`
})
export class AppBreadcrumb implements OnDestroy {
    private readonly _breadcrumbs$ = new BehaviorSubject<MenuItem[]>([]);

    readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

    home: MenuItem | undefined;

    menuSourceSubscription: Subscription;

    constructor(private router: Router) {
        this.home = { icon: 'pi pi-home', routerLink: '/app/activities' };

        this.menuSourceSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
            const root = this.router.routerState.snapshot.root;
            const breadcrumbs: MenuItem[] = [];
            this.addBreadcrumb(root, [], breadcrumbs);

            this._breadcrumbs$.next(breadcrumbs);
        });
    }

    private addBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: MenuItem[]) {
        const routeUrl = parentUrl.concat(route.url.map((url) => url.path));
        const breadcrumb = route.data['breadcrumb'];
        const parentBreadcrumb = route.parent && route.parent.data ? route.parent.data['breadcrumb'] : null;

        if (breadcrumb && breadcrumb !== parentBreadcrumb) {
            if (Array.isArray(breadcrumb)) {
                breadcrumbs.push(...(breadcrumb as MenuItem[]));
            } else {
                breadcrumbs.push({
                    label: breadcrumb,
                    routerLink: '/' + routeUrl.join('/')
                });
            }
        }

        if (route.firstChild) {
            this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
        }
    }

    ngOnDestroy() {
        if (this.menuSourceSubscription) {
            this.menuSourceSubscription.unsubscribe();
        }
    }
}