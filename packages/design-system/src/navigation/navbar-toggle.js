class PltNavbar extends HTMLElement {
  constructor() {
    super();
    this.toggle = null;
    this.panel = null;
    this.onToggleClick = this.onToggleClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);
  }

  connectedCallback() {
    this.toggle = this.querySelector('[data-plt-navbar-toggle]');
    this.panel = this.toggle
      ? this.querySelector(`#${this.toggle.getAttribute('aria-controls')}`)
      : null;
    if (!this.toggle || !this.panel) return;

    this.toggle.addEventListener('click', this.onToggleClick);
    this.addEventListener('keydown', this.onKeydown);
    document.addEventListener('click', this.onDocumentClick);
  }

  disconnectedCallback() {
    if (this.toggle) this.toggle.removeEventListener('click', this.onToggleClick);
    this.removeEventListener('keydown', this.onKeydown);
    document.removeEventListener('click', this.onDocumentClick);
  }

  isOpen() {
    return this.toggle?.getAttribute('aria-expanded') === 'true';
  }

  open() {
    if (!this.toggle || !this.panel) return;
    this.toggle.setAttribute('aria-expanded', 'true');
    this.panel.dataset.open = 'true';
    this.panel.hidden = false;
  }

  close() {
    if (!this.toggle || !this.panel) return;
    this.toggle.setAttribute('aria-expanded', 'false');
    this.panel.dataset.open = 'false';
    this.panel.hidden = true;
  }

  onToggleClick() {
    this.isOpen() ? this.close() : this.open();
  }

  onKeydown(e) {
    if (e.key === 'Escape' && this.isOpen()) {
      this.close();
      this.toggle.focus();
    }
  }

  onDocumentClick(e) {
    if (!this.isOpen()) return;
    if (this.contains(e.target)) return;
    this.close();
  }
}

if (!customElements.get('plt-navbar')) {
  customElements.define('plt-navbar', PltNavbar);
}
