import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule],
  template: `
    <div *ngIf="loading" class="fixed inset-0 flex justify-center items-center  bg-opacity-50 z-50">
      <p-progressSpinner />
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() loading: boolean = false;
}
