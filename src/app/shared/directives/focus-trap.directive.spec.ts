import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FocusTrapDirective } from './focus-trap.directive';

@Component({
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <button id="opener" (click)="open.set(true)">Open</button>
    <a id="outside" href="#outside">Outside link</a>
    <button id="fallback" #fallback tabindex="-1">Fallback</button>
    <div role="dialog" aria-modal="false"><button id="other-dialog-button">Other dialog</button></div>
    @if (open()) {
      <div id="dialog" appFocusTrap aria-labelledby="dialog-title" [appFocusTrapInitial]="useInitial ? primary : undefined"
           [appFocusTrapFallback]="fallback" (appFocusTrapEscape)="escapes = escapes + 1">
        <h2 id="dialog-title">Dialog</h2>
        <button id="first">First</button>
        <button id="primary" #primary>Primary</button>
        <button id="disabled" disabled>Disabled</button>
        <button id="last" (click)="inner.set(true)">Last</button>
        @if (inner()) {
          <div id="inner-dialog" appFocusTrap>
            <button id="inner-only">Inner</button>
          </div>
        }
      </div>
    }
  `
})
class DialogHostComponent {
  readonly open = signal(false);
  readonly inner = signal(false);
  useInitial = true;
  escapes = 0;
}

describe('FocusTrapDirective', () => {
  let fixture: ComponentFixture<DialogHostComponent>;
  let host: DialogHostComponent;
  const el = (id: string) => document.getElementById(id) as HTMLElement;
  const tab = (shiftKey = false) => {
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
    document.activeElement!.dispatchEvent(event);
    return event;
  };
  const afterClose = () => new Promise((resolve) => setTimeout(resolve));

  async function openDialog(): Promise<void> {
    el('opener').focus();
    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should mark the dialog as modal and move focus into it when it opens', async () => {
    await openDialog();
    const dialog = el('dialog');
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(el('primary'));
  });

  it('should focus the first control when no initial control is given', async () => {
    host.useInitial = false;
    await openDialog();
    expect(document.activeElement).toBe(el('first'));
  });

  it('should keep Tab and Shift+Tab inside the dialog, skipping disabled controls', async () => {
    await openDialog();
    el('last').focus();
    expect(tab().defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(el('first'));

    expect(tab(true).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(el('last'));

    // Between the first and last controls the browser moves focus as usual
    el('first').focus();
    expect(tab().defaultPrevented).toBe(false);
  });

  it('should bring focus back when it lands on background content', async () => {
    await openDialog();
    el('outside').focus();
    expect(document.activeElement).toBe(el('first'));
  });

  it('should bring focus back from another (non-modal) dialog that the modal covers', async () => {
    await openDialog();
    el('other-dialog-button').focus();
    expect(document.activeElement).toBe(el('first'));
  });

  it('should report Escape so dismissible dialogs can close', async () => {
    await openDialog();
    el('primary').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(host.escapes).toBe(1);
  });

  it('should return focus to the element that opened the dialog when it closes', async () => {
    await openDialog();
    host.open.set(false);
    fixture.detectChanges();
    await afterClose();
    expect(document.activeElement).toBe(el('opener'));
  });

  it('should use the fallback when the opener no longer exists', async () => {
    await openDialog();
    el('opener').remove();
    host.open.set(false);
    fixture.detectChanges();
    await afterClose();
    expect(document.activeElement).toBe(el('fallback'));
  });

  it('should let only the topmost of stacked dialogs manage focus, then hand focus back', async () => {
    await openDialog();
    el('last').focus();
    host.inner.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(el('inner-only'));

    // Tab cannot reach the dialog underneath, and focus moved there is brought back
    expect(tab().defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(el('inner-only'));
    el('first').focus();
    expect(document.activeElement).toBe(el('inner-only'));

    host.inner.set(false);
    fixture.detectChanges();
    await afterClose();
    expect(document.activeElement).toBe(el('last'));
  });
});
