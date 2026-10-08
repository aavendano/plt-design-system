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
      <plt-quick-view>
        <button data-quick-view-open>Open</button>
        <dialog>
          <div class="content">Content</div>
          <button data-quick-view-close>Close</button>
        </dialog>
      </plt-quick-view>
    `;

    // Polyfill getBoundingClientRect for dialog
    const dialog = document.querySelector('dialog');
    dialog.getBoundingClientRect = () => ({
      top: 100,
      right: 500,
      bottom: 500,
      left: 100,
      width: 400,
      height: 400,
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  it('opens dialog and locks scroll on open button click', () => {
    const openBtn = document.querySelector('[data-quick-view-open]');
    const dialog = document.querySelector('dialog');

    openBtn.click();

    expect(dialog.showModal).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes dialog and restores scroll on close button click', () => {
    const openBtn = document.querySelector('[data-quick-view-open]');
    const closeBtn = document.querySelector('[data-quick-view-close]');
    const dialog = document.querySelector('dialog');

    document.body.style.overflow = 'scroll'; // Simulate previous state
    openBtn.click();
    expect(document.body.style.overflow).toBe('hidden');

    closeBtn.click();
    expect(dialog.close).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('scroll'); // Restored
  });

  it('closes dialog on clicking outside modal backdrop', () => {
    const openBtn = document.querySelector('[data-quick-view-open]');
    const dialog = document.querySelector('dialog');
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
    const openBtn = document.querySelector('[data-quick-view-open]');
    const dialog = document.querySelector('dialog');
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
    const openBtn = document.querySelector('[data-quick-view-open]');
    const closeBtn = document.querySelector('[data-quick-view-close]');
    const externalBtn = document.getElementById('external-focus');

    externalBtn.focus();
    expect(document.activeElement).toBe(externalBtn);

    openBtn.click();

    closeBtn.click();
    expect(document.activeElement).toBe(externalBtn);
  });
});
