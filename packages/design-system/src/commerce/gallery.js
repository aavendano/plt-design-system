class ProductGallery extends HTMLElement {
  constructor() {
    super();
    this.thumbs = [];
    this.mainImage = null;
    this.handleThumbClick = this.handleThumbClick.bind(this);
  }

  connectedCallback() {
    this.thumbs = Array.from(this.querySelectorAll('.plt-product-detail__thumb'));
    this.mainImage = this.querySelector('.plt-product-detail__gallery-main img');

    if (!this.mainImage || this.thumbs.length === 0) return;

    this.thumbs.forEach((thumb) => {
      thumb.addEventListener('click', this.handleThumbClick);
    });

    // Initialize first thumb as current only if none is currently selected
    const hasCurrent = this.thumbs.some(t => t.getAttribute('aria-current') === 'true');
    if (!hasCurrent && this.thumbs.length > 0) {
      this.thumbs[0].setAttribute('aria-current', 'true');
    }
  }

  disconnectedCallback() {
    this.thumbs.forEach((thumb) => {
      thumb.removeEventListener('click', this.handleThumbClick);
    });
  }

  handleThumbClick(e) {
    const thumb = e.currentTarget;
    const img = thumb.querySelector('img');
    if (img && this.mainImage) {
      this.mainImage.src = img.src;
      this.mainImage.alt = img.alt || '';

      // Manage ARIA attributes
      this.thumbs.forEach(t => t.setAttribute('aria-current', 'false'));
      thumb.setAttribute('aria-current', 'true');
    }
  }
}

if (!customElements.get('plt-product-gallery')) {
  customElements.define('plt-product-gallery', ProductGallery);
}
