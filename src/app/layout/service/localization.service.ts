// localization.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
    code: string;
    name: string;
    flag: string;
}

@Injectable({
    providedIn: 'root'
})
export class LocalizationService {
    languages: Language[] = [
        { code: 'en', name: 'English', flag: 'us' },
        { code: 'ar', name: 'Arabic', flag: 'eg' },
    ];

    private currentLanguageSubject = new BehaviorSubject<Language>(this.languages[0]);
    currentLanguage$ = this.currentLanguageSubject.asObservable();

    constructor(private translateService: TranslateService) {
        // Initialization is now handled by APP_INITIALIZER in app.config.ts
    }

    changeLanguage(language: Language) {
        // This service seems unused. The logic is in app.topbar.ts now.
        // If you intend to use this service, ensure it uses the 'appLanguage' key.
        // For now, we'll leave it as is to avoid breaking other parts of the app,
        // but the initialization logic is removed.
    }

    getCurrentLanguage(): Language {
        return this.currentLanguageSubject.value;
    }
}