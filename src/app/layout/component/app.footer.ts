import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Roles Management by
        <a href="https://seif-mustafa.github.io/portfolio/" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Seif Mostafa</a>
    </div>`
})
export class AppFooter {}
