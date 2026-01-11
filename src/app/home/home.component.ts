import { Component, ViewChild, inject } from '@angular/core';
import { ArticleViewComponent } from '../article-view/article-view.component';
import { Subject, debounceTime, filter, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { PhraseSheetComponent } from '../phrase-sheet/phrase-sheet.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ArticleViewComponent, MatBottomSheetModule],
  template: `
    <p class="selection-hint">
      Zaznacz dowolny fragment lub słowo, aby zobaczyć jego tłumaczenie i przykłady użycia.
    </p>
    <app-article-view (selectedPhrase)="onPhraseSelected($event)" />
  `,
  styles: [`
    .selection-hint {
      text-align: center;
      color: #757575;
      font-size: 0.9rem;
      margin-top: 1.5rem;
      font-style: italic;
    }
  `]
})
export class HomeComponent {
  @ViewChild(ArticleViewComponent) articleView?: ArticleViewComponent;
  private readonly selection$ = new Subject<string>();
  private readonly bottomSheet = inject(MatBottomSheet);

  constructor() {
    this.selection$
      .pipe(
        map((phrase) => phrase.trim()),
        filter((phrase) => phrase.length > 0),
        debounceTime(400),
        takeUntilDestroyed()
      )
      .subscribe((phrase) => {
        const bottomSheetRef = this.bottomSheet.open(PhraseSheetComponent, {
          data: { phrase },
        });

        bottomSheetRef.afterDismissed().subscribe(() => {
          this.articleView?.clearSelection();
        });
      });
  }

  protected onPhraseSelected(phrase: string): void {
    this.selection$.next(phrase);
  }
}
