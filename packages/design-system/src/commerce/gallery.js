class ProductGallery extends HTMLElement {
  constructor() {
    super();
    this.thumbs = Array.from(this.querySelectorAll('.plt-product-detail__thumb'));
    this.mainImage = this.querySelector('.plt-product-detail__gallery-main img');

    if (!this.mainImage || this.thumbs.length === 0) return;

    this.thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const img = thumb.querySelector('img');
        if (img) {
          this.mainImage.src = img.src;
          this.mainImage.alt = img.alt || '';

          // Manage ARIA attributes
          this.thumbs.forEach(t => t.setAttribute('aria-current', 'false'));
          thumb.setAttribute('aria-current', 'true');
        }
      });
    });

    // Initialize first thumb as current
    this.thumbs[0].setAttribute('aria-current', 'true');
  }
}

if (!customElements.get('plt-product-gallery')) {
  customElements.define('plt-product-gallery', ProductGallery);
}
