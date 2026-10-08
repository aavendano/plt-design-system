class ProductQuickView extends HTMLElement {
  constructor() {
    super();
    this.dialog = this.querySelector('dialog');
    this.openBtn = this.querySelector('[data-quick-view-open]');
    this.closeBtn = this.querySelector('[data-quick-view-close]');

    if (!this.dialog) return;

    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => {
        this.dialog.showModal();
        document.body.style.overflow = 'hidden';
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    this.dialog.addEventListener('click', (e) => {
      const rect = this.dialog.getBoundingClientRect();
      if (
        e.clientY < rect.top ||
        e.clientY > rect.bottom ||
        e.clientX < rect.left ||
        e.clientX > rect.right
      ) {
        this.close();
      }
    });

    this.dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }

  close() {
    this.dialog.close();
    document.body.style.overflow = '';
  }
}

if (!customElements.get('plt-quick-view')) {
  customElements.define('plt-quick-view', ProductQuickView);
}
