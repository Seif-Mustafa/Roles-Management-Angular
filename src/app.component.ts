import { Component, Inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`,
  providers: [MessageService]
})
export class AppComponent implements OnInit {
  protected readonly title = signal('roles-management-app');

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    // عند التشغيل: طبّق الاتجاه حسب اللغة الحالية/الافتراضية
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    this.applyDir(lang);

    // لو اللغة اتغيرت أثناء التشغيل
    this.translate.onLangChange.subscribe(e => this.applyDir(e.lang));
  }

  useLanguage(language: string): void {
    this.translate.use(language);
    this.applyDir(language); // فورًا، بالإضافة إلى onLangChange
  }

  // private applyDir(lang: string) {
  //   const isRtl = /^(ar|he|fa|ur)/i.test(lang);
  //   const dir = isRtl ? 'rtl' : 'ltr';

  //   // على مستوى الوثيقة كلها (يشمل الـ overlays)
  //   this.document.documentElement.setAttribute('lang', lang);
  //   this.document.documentElement.setAttribute('dir', dir);
  //   this.document.body.setAttribute('dir', dir); // احتياطًا لبعض المكوّنات
  // }

  private applyDir(lang: string) {
  const isRtl = /^(ar|he|fa|ur)/i.test(lang);
  const dir = isRtl ? 'rtl' : 'ltr';

  this.document.documentElement.setAttribute('lang', lang);
  this.document.documentElement.setAttribute('dir', dir);
  this.document.body.setAttribute('dir', dir);

  // أضف/أزل كلاس rtl على الـ body
  this.document.body.classList.toggle('rtl', isRtl);
}

}