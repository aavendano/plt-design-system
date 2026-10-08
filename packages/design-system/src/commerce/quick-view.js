const openDialogs = new Set();
let previousOverflow = '';

class ProductQuickView extends HTMLElement {
  constructor() {
    super();
    this.dialog = null;
    this.openBtn = null;
    this.closeBtn = null;
    this.previousFocus = null;

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
  }

  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.openBtn = this.querySelector('[data-quick-view-open]');
    this.closeBtn = this.querySelector('[data-quick-view-close]');

    if (!this.dialog) return;

    if (this.openBtn) {
      this.openBtn.addEventListener('click', this.open);
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', this.close);
    }

    this.dialog.addEventListener('click', this.handleOutsideClick);
    this.dialog.addEventListener('close', this.handleDialogClose);
  }

  disconnectedCallback() {
    if (this.openBtn) {
      this.openBtn.removeEventListener('click', this.open);
    }

    if (this.closeBtn) {
      this.closeBtn.removeEventListener('click', this.close);
    }

    if (this.dialog) {
      this.dialog.removeEventListener('click', this.handleOutsideClick);
      this.dialog.removeEventListener('close', this.handleDialogClose);

      // If removed from DOM while open, clean up
      if (openDialogs.has(this)) {
        openDialogs.delete(this);
        if (openDialogs.size === 0) {
          document.body.style.overflow = previousOverflow;
        }
      }
    }
  }

  open() {
    if (!this.dialog || openDialogs.has(this)) return;

    this.previousFocus = document.activeElement;

    if (openDialogs.size === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    openDialogs.add(this);
    this.dialog.showModal();
  }

  close() {
    if (!this.dialog || !openDialogs.has(this)) return;
    this.dialog.close();
  }

  handleOutsideClick(e) {
    if (!this.dialog) return;
    // ensure click is strictly on the dialog backdrop, not inner content
    if (e.target !== this.dialog) return;

    const rect = this.dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      this.close();
    }
  }

  handleDialogClose() {
    if (openDialogs.has(this)) {
      openDialogs.delete(this);

      if (openDialogs.size === 0) {
        document.body.style.overflow = previousOverflow;
      }
    }

    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }
}

if (!customElements.get('plt-quick-view')) {
  customElements.define('plt-quick-view', ProductQuickView);
}
