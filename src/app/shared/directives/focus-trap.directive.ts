import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input, output } from '@angular/core';

const FOCUSABLE = [
  'a[href]', 'area[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', 'summary', '[tabindex]:not([tabindex="-1"])'
].join(', ');

/** Open dialogs, most recently opened last. Only the topmost one manages keyboard focus. */
const openDialogs: FocusTrapDirective[] = [];

/**
 * Modal keyboard focus for an in-page dialog: focus moves into the dialog when it opens, Tab and
 * Shift+Tab cycle through its controls only, focus that lands outside it is brought back, and when it
 * closes focus returns to the element that opened it (or to the fallback when that element is gone).
 * Escape is reported through `appFocusTrapEscape`; bind it only for dialogs that may be dismissed.
 */
@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    tabindex: '-1',
    '(keydown)': 'onKeydown($event)'
  }
})
export class FocusTrapDirective implements OnDestroy {
  /** Control to focus when the dialog opens (defaults to its first focusable element). */
  readonly initialFocus = input<HTMLElement | undefined>(undefined, { alias: 'appFocusTrapInitial' });
  /** Where focus goes on close when the element that opened the dialog no longer exists. */
  readonly returnFallback = input<HTMLElement | undefined>(undefined, { alias: 'appFocusTrapFallback' });
  readonly escape = output<void>({ alias: 'appFocusTrapEscape' });

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly opener: HTMLElement | null;
  private readonly keepFocusInside = (event: FocusEvent) => {
    const target = event.target as Node | null;
    if (!this.isTopmost() || !target || this.host.contains(target)) {
      return;
    }
    // A separate dialog shown above the page (e.g. the portfolio guide) keeps its own focus
    const otherDialog = target instanceof Element ? target.closest('[role="dialog"]') : null;
    if (otherDialog && !openDialogs.some((dialog) => dialog.host.contains(otherDialog))) {
      return;
    }
    this.focusables()[0]?.focus({ preventScroll: true });
  };

  constructor() {
    const active = this.document.activeElement;
    this.opener = active instanceof HTMLElement && active !== this.document.body ? active : null;
    openDialogs.push(this);
    this.document.addEventListener('focusin', this.keepFocusInside, true);
    afterNextRender(() => {
      if (this.isTopmost()) {
        (this.initialFocus() ?? this.focusables()[0] ?? this.host).focus({ preventScroll: true });
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isTopmost()) {
      return;
    }
    if (event.key === 'Escape') {
      this.escape.emit();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const items = this.focusables();
    const active = this.document.activeElement;
    if (!items.length) {
      event.preventDefault();
      this.host.focus({ preventScroll: true });
    } else if (event.shiftKey && (active === items[0] || active === this.host)) {
      event.preventDefault();
      items[items.length - 1].focus({ preventScroll: true });
    } else if (!event.shiftKey && active === items[items.length - 1]) {
      event.preventDefault();
      items[0].focus({ preventScroll: true });
    }
  }

  ngOnDestroy(): void {
    const index = openDialogs.indexOf(this);
    if (index >= 0) {
      openDialogs.splice(index, 1);
    }
    this.document.removeEventListener('focusin', this.keepFocusInside, true);
    const targets = [this.opener, this.returnFallback()];
    // After the view update: the page or the next dialog may already have placed focus on purpose
    setTimeout(() => {
      const active = this.document.activeElement;
      if (active && active !== this.document.body) {
        return;
      }
      targets.find((el) => el?.isConnected && !el.closest('[inert]'))?.focus({ preventScroll: true });
    });
  }

  private isTopmost(): boolean {
    return openDialogs[openDialogs.length - 1] === this;
  }

  private focusables(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
      if (el.closest('[inert], [hidden]')) {
        return false;
      }
      const style = getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }
}
