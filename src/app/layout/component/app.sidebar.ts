import { Component, ElementRef, HostBinding } from '@angular/core';
import { AppMenu } from './app.menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu],
    template: ` <div class="layout-sidebar">
        <app-menu></app-menu>
    </div>`
})
// template: ` <div [class]="appLanguage === 'en' ? '' : 'layout-sidebar layout-sidebar-rtl'">
export class AppSidebar {
    appLanguage: string = 'ar';
    constructor(public el: ElementRef) {}
    ngOnInit() {
        this.appLanguage = localStorage.getItem('appLanguage') || 'en';
    }
}
