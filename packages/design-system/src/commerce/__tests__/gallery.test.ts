import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../gallery.js';

describe('ProductGallery custom element', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <plt-product-gallery>
        <div class="plt-product-detail__gallery-main">
          <img src="main.jpg" alt="main image" />
        </div>
        <div class="plt-product-detail__thumb" aria-current="false">
          <img src="thumb1.jpg" alt="thumb 1" />
        </div>
        <div class="plt-product-detail__thumb" aria-current="false">
          <img src="thumb2.jpg" alt="thumb 2" />
        </div>
      </plt-product-gallery>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('initializes the first thumbnail as current on connect', () => {
    const gallery = document.querySelector('plt-product-gallery');
    const thumbs = gallery.querySelectorAll('.plt-product-detail__thumb');

    expect(thumbs[0].getAttribute('aria-current')).toBe('true');
    expect(thumbs[1].getAttribute('aria-current')).toBe('false');
  });

  it('updates main image and aria-current on thumbnail click', () => {
    const gallery = document.querySelector('plt-product-gallery');
    const thumbs = gallery.querySelectorAll('.plt-product-detail__thumb');
    const mainImg = gallery.querySelector('.plt-product-detail__gallery-main img');

    thumbs[1].click();

    expect(mainImg.src).toContain('thumb2.jpg');
    expect(mainImg.alt).toBe('thumb 2');
    expect(thumbs[0].getAttribute('aria-current')).toBe('false');
    expect(thumbs[1].getAttribute('aria-current')).toBe('true');
  });

  it('cleans up event listeners on disconnect', () => {
    const gallery = document.querySelector('plt-product-gallery');
    const thumbs = gallery.querySelectorAll('.plt-product-detail__thumb');
    const mainImg = gallery.querySelector('.plt-product-detail__gallery-main img');

    gallery.remove();

    thumbs[1].click();

    // After removing element, clicks shouldn't update the image anymore
    // (though in a real DOM environment, disconnecting removes the node but we still have references to it.
    // the event listeners are removed, so this click won't trigger the custom element's handler)
    expect(mainImg.src).toContain('main.jpg');
  });
});
