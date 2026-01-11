import { Component, OnInit, output, inject, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="article-container"
      (mousedown)="handleMouseDown($event)"
      (mousemove)="handleMouseMove($event)"
      (mouseup)="handleMouseUp()"
      (touchstart)="handleTouchStart($event)"
      (touchmove)="handleTouchMove($event)"
      (touchend)="handleTouchEnd()"
    >
      <header>
        <h1 [innerHTML]="processedTitle"></h1>
      </header>

      <img
        src="https://images.unsplash.com/photo-1633362501620-447ba5b52a82?q=80&w=1170&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Person reading a book"
        class="article-image"
      />

      <section class="content">
        <p *ngFor="let paragraph of processedParagraphs" [innerHTML]="paragraph"></p>
      </section>
    </article>
  `,
  styles: [
    `
      .article-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
        line-height: 1.6;
        color: #333;
        font-family: 'Playfair Display', 'Georgia', serif;
        -webkit-touch-callout: none;
        user-select: none;
        -webkit-user-select: none;
      }
      h1 {
        font-size: 2.5rem;
        color: #1a1a1a;
        margin-bottom: 1.5rem;
        line-height: 1.2;
      }
      .article-image {
        width: 100%;
        height: auto;
        margin-bottom: 2rem;
        border-radius: 8px;
      }
      p {
        margin-bottom: 1.25rem;
        font-size: 1.1rem;
      }
      :host ::ng-deep span[data-word] {
        cursor: pointer;
      }
      :host ::ng-deep span[data-word]:hover {
        background-color: #f0f0f0;
      }
      :host ::ng-deep span.selected {
        background-color: #ffd700;
      }
    `,
  ],
})
export class ArticleViewComponent implements OnInit {
  readonly selectedPhrase = output<string>();
  private readonly sanitizer = inject(DomSanitizer);
  private readonly renderer = inject(Renderer2);
  private readonly elementRef = inject(ElementRef);

  private isSelecting = false;
  private startWordElement: HTMLElement | null = null;
  private selectionEndWordElement: HTMLElement | null = null;
  private longPressTimer: any;
  private touchStartPosition: { x: number; y: number } | null = null;
  private readonly longPressDuration = 300; // ms
  private readonly touchMoveThreshold = 10; // px

  rawTitle = 'The Power of Reading: Elevating Your Language Journey';
  rawParagraphs: string[] = [
    'This article serves as a demo of the application, showcasing how curated content can accelerate your path to fluency. Within this interface, each word or phrase can be highlighted to instantly see its translation and practical example sentences, removing the friction of looking up definitions manually. By engaging with authentic materials this way, you bridge the gap between classroom theory and real-world communication.',
    'One of the primary benefits is the organic acquisition of vocabulary. Unlike memorizing isolated word lists, reading allows you to see how words function within a specific context. You begin to notice collocations—words that naturally pair together—and nuanced meanings that a dictionary might miss. This contextual learning ensures that you don\'t just know what a word means, but you also understand how and when to use it effectively in conversation.',
    'Furthermore, reading articles significantly improves your grasp of complex grammar and syntax. Seeing advanced structures used to convey actual news, opinions, or stories helps internalize the rules of the language. Instead of struggling with abstract conjugation tables, you witness the "why" behind the grammar. Over time, your brain begins to recognize these patterns automatically, making your own speech and writing feel more intuitive and less like a translation exercise.',
    'Finally, reading in a foreign language provides invaluable cultural insight. Languages are deeply tied to the cultures that speak them; an article about local traditions, politics, or social trends offers a window into the mindset of native speakers. This cultural literacy is the "secret sauce" of communication, allowing you to connect with others on a deeper level. By making reading a daily habit, you aren\'t just learning a language—you are expanding your worldview.'
  ];

  processedTitle: SafeHtml = '';
  processedParagraphs: SafeHtml[] = [];

  ngOnInit(): void {
    this.processedTitle = this.processText(this.rawTitle);
    this.processedParagraphs = this.rawParagraphs.map((p) => this.processText(p));
  }

  private processText(text: string): SafeHtml {
    const processedHtml = text.replace(/([a-zA-Z'’]+)/g, (match) => {
      return `<span data-word="${match}">${match}</span>`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(processedHtml);
  }

  handleMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.selectionStart(target);
    event.preventDefault();
  }

  handleMouseMove(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.selectionMove(target);
  }

  handleMouseUp(): void {
    this.selectionEnd();
  }

  handleTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.touchStartPosition = { x: touch.clientX, y: touch.clientY };
    }

    this.longPressTimer = setTimeout(() => {
      const target = this.getWordElementFromTouchEvent(event);
      this.selectionStart(target);
      // Only prevent default behavior when selection starts.
      event.preventDefault();
      this.longPressTimer = null;
    }, this.longPressDuration);
  }

  handleTouchMove(event: TouchEvent): void {
    if (this.longPressTimer && this.touchStartPosition) {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartPosition.x);
        const deltaY = Math.abs(touch.clientY - this.touchStartPosition.y);
        if (deltaX > this.touchMoveThreshold || deltaY > this.touchMoveThreshold) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }
      }
    } else if (this.isSelecting) {
      const target = this.getWordElementFromTouchEvent(event);
      this.selectionMove(target);
    }
  }

  handleTouchEnd(): void {
    clearTimeout(this.longPressTimer);
    this.longPressTimer = null;
    if (this.isSelecting) {
      this.selectionEnd();
    }
  }

  private getWordElementFromTouchEvent(event: TouchEvent): HTMLElement | null {
    if (event.touches.length === 0) {
      return null;
    }
    const touch = event.touches[0];
    return document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
  }

  private selectionStart(target: HTMLElement | null): void {
    if (target && this.isWordElement(target)) {
      this.isSelecting = true;
      this.startWordElement = target;
      this.selectionEndWordElement = target;
      this.highlightWords();
    }
  }

  private selectionMove(target: HTMLElement | null): void {
    if (this.isSelecting && target && this.isWordElement(target) && target !== this.selectionEndWordElement) {
      this.selectionEndWordElement = target;
      this.highlightWords();
    }
  }

  private selectionEnd(): void {
    if (this.isSelecting && this.startWordElement && this.selectionEndWordElement) {
      const selectedWords = this.getSelectedWords();
      if (selectedWords.length > 0) {
        this.selectedPhrase.emit(selectedWords.join(' '));
      }
    }
    this.isSelecting = false;
    this.startWordElement = null;
    this.selectionEndWordElement = null;
    // Keep the highlights until the next selection starts to show the user what was selected.
    // this.clearHighlights();
  }

  private highlightWords(): void {
    this.clearHighlights();
    const words = this.getWordsInSelection();
    words.forEach(word => this.renderer.addClass(word, 'selected'));
  }

  private getSelectedWords(): string[] {
    return this.getWordsInSelection().map(el => el.dataset['word'] || '');
  }

  private getWordsInSelection(): HTMLElement[] {
    if (!this.startWordElement || !this.selectionEndWordElement) {
      return [];
    }

    const allWords = Array.from(this.elementRef.nativeElement.querySelectorAll('[data-word]')) as HTMLElement[];
    const startIndex = allWords.indexOf(this.startWordElement);
    const endIndex = allWords.indexOf(this.selectionEndWordElement);

    if (startIndex === -1 || endIndex === -1) {
      return [];
    }

    const [start, end] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
    return allWords.slice(start, end + 1);
  }

  private clearHighlights(): void {
    const selectedElements = this.elementRef.nativeElement.querySelectorAll('.selected');
    selectedElements.forEach((el: Element) => this.renderer.removeClass(el, 'selected'));
  }

  private isWordElement(element: HTMLElement): element is HTMLElement {
    return element.tagName === 'SPAN' && 'word' in element.dataset;
  }

  public clearSelection(): void {
    this.clearHighlights();
  }
}
