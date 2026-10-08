import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../quick-view.js';

describe('ProductQuickView custom element', () => {
  beforeEach(() => {
    // Mock showModal and close for dialog since jsdom doesn't fully support them
    HTMLDialogElement.prototype.showModal = vi.fn(function() {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function() {
      this.removeAttribute('open');
      const closeEvent = new Event('close');
      this.dispatchEvent(closeEvent);
    });

    document.body.innerHTML = `
      <button id="external-focus">External Button</button>
      <plt-quick-view id="qv1">
        <button data-quick-view-open>Open 1</button>
        <dialog>
          <div class="content">Content 1</div>
          <button data-quick-view-close>Close 1</button>
        </dialog>
      </plt-quick-view>
      <plt-quick-view id="qv2">
        <button data-quick-view-open>Open 2</button>
        <dialog>
          <div class="content">Content 2</div>
          <button data-quick-view-close>Close 2</button>
        </dialog>
      </plt-quick-view>
    `;

    // Polyfill getBoundingClientRect for dialog
    document.querySelectorAll('dialog').forEach(dialog => {
      dialog.getBoundingClientRect = () => ({
        top: 100,
        right: 500,
        bottom: 500,
        left: 100,
        width: 400,
        height: 400,
      });
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  it('opens dialog and locks scroll on open button click', () => {
    const qv1 = document.getElementById('qv1');
    const openBtn = qv1.querySelector('[data-quick-view-open]');
    const dialog = qv1.querySelector('dialog');

    openBtn.click();

    expect(dialog.showModal).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes dialog and restores scroll on close button click', () => {
    const qv1 = document.getElementById('qv1');
    const openBtn = qv1.querySelector('[data-quick-view-open]');
    const closeBtn = qv1.querySelector('[data-quick-view-close]');
    const dialog = qv1.querySelector('dialog');

    document.body.style.overflow = 'scroll'; // Simulate previous state
    openBtn.click();
    expect(document.body.style.overflow).toBe('hidden');

    closeBtn.click();
    expect(dialog.close).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('scroll'); // Restored
  });

  it('handles multiple concurrent dialogs correctly (scroll lock shared)', () => {
    const qv1 = document.getElementById('qv1');
    const openBtn1 = qv1.querySelector('[data-quick-view-open]');
    const closeBtn1 = qv1.querySelector('[data-quick-view-close]');

    const qv2 = document.getElementById('qv2');
    const openBtn2 = qv2.querySelector('[data-quick-view-open]');
    const closeBtn2 = qv2.querySelector('[data-quick-view-close]');

    document.body.style.overflow = 'scroll';

    // Open first
    openBtn1.click();
    expect(document.body.style.overflow).toBe('hidden');

    // Open second
    openBtn2.click();
    expect(document.body.style.overflow).toBe('hidden');

    // Idempotent check
    openBtn1.click();
    expect(document.body.style.overflow).toBe('hidden');

    // Close first, should still be hidden
    closeBtn1.click();
    expect(document.body.style.overflow).toBe('hidden');

    // Close second, should restore
    closeBtn2.click();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('restores overflow when unmounted while open', () => {
    const qv1 = document.getElementById('qv1');
    const openBtn1 = qv1.querySelector('[data-quick-view-open]');

    document.body.style.overflow = 'scroll';
    openBtn1.click();
    expect(document.body.style.overflow).toBe('hidden');

    qv1.remove(); // Removes from DOM triggering disconnectedCallback
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('closes correctly when native escape triggers close event', () => {
    const qv1 = document.getElementById('qv1');
    const openBtn1 = qv1.querySelector('[data-quick-view-open]');
    const dialog1 = qv1.querySelector('dialog');

    document.body.style.overflow = 'scroll';
    openBtn1.click();
    expect(document.body.style.overflow).toBe('hidden');

    // Simulate native ESC key which triggers close on dialog directly
    const closeEvent = new Event('close');
    dialog1.dispatchEvent(closeEvent);

    expect(document.body.style.overflow).toBe('scroll');
  });

  it('closes dialog on clicking outside modal backdrop', () => {
    const qv1 = document.getElementById('qv1');
    const openBtn = qv1.querySelector('[data-quick-view-open]');
    const dialog = qv1.querySelector('dialog');
    openBtn.click();

    // Click outside bounding box
    const event = new MouseEvent('click', {
      clientX: 50,
      clientY: 50,
      bubbles: true,
    });
    // the target must be the dialog to simulate backdrop click
    Object.defineProperty(event, 'target', { value: dialog, enumerable: true });

    dialog.dispatchEvent(event);

    expect(dialog.close).toHaveBeenCalled();
  });

  it('does not close dialog on clicking inside modal content', () => {
    const qv1 = document.getElementById('qv1');
    const openBtn = qv1.querySelector('[data-quick-view-open]');
    const dialog = qv1.querySelector('dialog');
    const content = dialog.querySelector('.content');
    openBtn.click();

    // Click inside
    const event = new MouseEvent('click', {
      clientX: 200,
      clientY: 200,
      bubbles: true,
    });
    Object.defineProperty(event, 'target', { value: content, enumerable: true });

    dialog.dispatchEvent(event);

    expect(dialog.close).not.toHaveBeenCalled();
  });

  it('restores focus after closing', () => {
    const qv1 = document.getElementById('qv1');
    const openBtn = qv1.querySelector('[data-quick-view-open]');
    const closeBtn = qv1.querySelector('[data-quick-view-close]');
    const externalBtn = document.getElementById('external-focus');

    externalBtn.focus();
    expect(document.activeElement).toBe(externalBtn);

    openBtn.click();

    closeBtn.click();
    expect(document.activeElement).toBe(externalBtn);
  });
});
