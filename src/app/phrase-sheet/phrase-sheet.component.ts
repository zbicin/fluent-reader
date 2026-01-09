import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-phrase-sheet',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule, MatListModule],
  template: `
    <div class="sheet-container">
      <h3 class="selected-phrase">{{ data.phrase }}</h3>
      
      @if (isTranslationLoading()) {
        <mat-spinner diameter="20" class="translation-spinner"></mat-spinner>
      } @else {
        <h4 class="translation">przyjąć, zaakceptować</h4>
      }
      
      <div class="content-area">
        @if (isLoading()) {
          <div class="loader-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (showExamples()) {
          <mat-list>
            <mat-list-item>
              <span matListItemTitle><i>To grow, one must learn to <b>embrace</b> change.</i></span>
              <span matListItemLine>Aby rosnąć, trzeba nauczyć się akceptować zmiany.</span>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle><i>They decided to <b>embrace</b> the new culture during their travels.</i></span>
              <span matListItemLine>Zdecydowali się przyjąć nową kulturę podczas swoich podróży.</span>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle><i>It is important to <b>embrace</b> every opportunity that comes your way.</i></span>
              <span matListItemLine>Ważne jest, aby wykorzystywać każdą okazję, która staje na Twojej drodze.</span>
            </mat-list-item>
          </mat-list>
        } @else {
          <div class="actions">
            <button mat-stroked-button color="primary" (click)="loadExamples()">Pokaż przykłady użycia</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .sheet-container {
      padding: 24px;
      min-height: 150px;
    }
    .selected-phrase {
      font-family: 'Playfair Display', 'Georgia', serif;
      font-style: italic;
      font-size: 1.75rem;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    .translation {
      font-weight: 400;
      color: #666;
      margin-bottom: 24px;
    }
    .translation-spinner {
      margin-bottom: 24px;
    }
    .actions {
      display: flex;
      justify-content: flex-start;
    }
    .loader-container {
      display: flex;
      justify-content: center;
      padding: 1rem;
    }
  `]
})
export class PhraseSheetComponent implements OnInit {
  isLoading = signal(false);
  showExamples = signal(false);
  isTranslationLoading = signal(true);

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { phrase: string }) {}

  ngOnInit() {
    setTimeout(() => {
      this.isTranslationLoading.set(false);
    }, 400);
  }

  loadExamples() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.showExamples.set(true);
    }, 1500);
  }
}
