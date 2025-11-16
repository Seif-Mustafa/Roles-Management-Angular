import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    constructor(private messageService: MessageService, private translate: TranslateService) {}

    /**
     * Shows a toast message.
     * @param severity The severity of the message ('success', 'info', 'warn', 'error').
     * @param summary The summary text of the message.
     * @param detail The detail text of the message.
     * @param life The duration in milliseconds.
     */
    show(severity: 'success' | 'info' | 'warn' | 'error', summaryKey: string, detailKey: string, life: number = 3000): void {
        const summary = this.translate.instant(summaryKey);
        const detail = this.translate.instant(detailKey);
        this.messageService.add({
            severity: severity,
            summary: summary,
            detail: detail,
            life: life
        });
    }

    success(summaryKey: string, detailKey: string, life: number = 3000): void {
        this.show('success', summaryKey, detailKey, life);
    }

    info(summaryKey: string, detailKey: string, life: number = 3000): void {
        this.show('info', summaryKey, detailKey, life);
    }

    warn(summaryKey: string, detailKey: string, life: number = 3000): void {
        this.show('warn', summaryKey, detailKey, life);
    }

    error(summaryKey: string, detailKey: string, life: number = 3000): void {
        this.show('error', summaryKey, detailKey, life);
    }
}
