import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/product/define';

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

describe('ProductGallery slides, zoom, lightbox and thumbnail track', () => {
  const html = `
    <plt-product-gallery>
      <div>
        <div data-plt-gallery-slide data-media-id="11">
          <div data-plt-gallery-zoom><img src="a.jpg" alt="a" /></div>
          <a href="a-large.jpg" data-plt-gallery-zoom-open data-zoom-alt="A large">Zoom</a>
        </div>
        <div data-plt-gallery-slide data-media-id="22"><video autoplay muted loop></video></div>
        <div data-plt-gallery-slide data-media-id="33">3d</div>
      </div>
      <div data-plt-gallery-thumb-track>
        <button type="button" role="tab" data-plt-gallery-thumb aria-label="one"><img src="t1.jpg" alt="" /></button>
        <button type="button" role="tab" data-plt-gallery-thumb aria-label="two"></button>
        <button type="button" role="tab" data-plt-gallery-thumb aria-label="three"></button>
      </div>
      <button type="button" data-plt-gallery-thumbs-next>next</button>
      <dialog data-plt-gallery-lightbox>
        <img data-plt-gallery-lightbox-image alt="" />
        <button type="button" data-plt-gallery-lightbox-close>close</button>
      </dialog>
    </plt-product-gallery>`;

  beforeEach(() => {
    document.body.innerHTML = html;
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const q = () => {
    const gallery = document.querySelector('plt-product-gallery');
    return {
      gallery,
      slides: [...gallery.querySelectorAll('[data-plt-gallery-slide]')],
      thumbs: [...gallery.querySelectorAll('[data-plt-gallery-thumb]')],
      dialog: gallery.querySelector('dialog'),
    };
  };

  it('shows only the selected slide and marks the tab', () => {
    const { slides, thumbs } = q();
    expect(slides.map((s) => s.hidden)).toEqual([false, true, true]);
    expect(thumbs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    thumbs[2].click();
    expect(slides.map((s) => s.hidden)).toEqual([true, true, false]);
    expect(thumbs[2].getAttribute('aria-current')).toBe('true');
    expect(thumbs[2].getAttribute('aria-selected')).toBe('true');
  });

  it('starts on the slide the server marked current', () => {
    document.body.innerHTML = html.replace('role="tab" data-plt-gallery-thumb aria-label="two"', 'role="tab" data-plt-gallery-thumb aria-current="true" aria-label="two"');
    const { slides } = q();
    expect(slides.map((s) => s.hidden)).toEqual([true, false, true]);
  });

  it('selectMedia picks a slide by media id and reports whether it matched', async () => {
    const { gallery, slides } = q();
    const seen = [];
    gallery.addEventListener('plt:gallery-change', (e) => seen.push(e.detail));
    expect(gallery.selectMedia(22)).toBe(true);
    expect(slides[1].hidden).toBe(false);
    expect(seen).toEqual([{ index: 1, src: '', mediaId: '22' }]);
    expect(gallery.selectMedia(999)).toBe(false);
    expect(gallery.selectMedia(null)).toBe(false);
    expect(slides[1].hidden).toBe(false);
  });

  it('pauses video in the slide that is hidden and resumes an autoplay one', () => {
    const { gallery, slides } = q();
    const video = slides[1].querySelector('video');
    let paused = 0;
    let played = 0;
    video.pause = () => { paused += 1; };
    video.play = () => { played += 1; return Promise.resolve(); };
    gallery.select(1);
    expect(played).toBe(1);
    gallery.select(2);
    expect(paused).toBe(1);
  });

  it('follows the pointer over the zoom pane and resets on leave', () => {
    const { gallery } = q();
    const pane = gallery.querySelector('[data-plt-gallery-zoom]');
    pane.getBoundingClientRect = () => ({ left: 100, top: 50, width: 200, height: 100, right: 300, bottom: 150 });
    const move = new Event('pointermove', { bubbles: true });
    Object.assign(move, { clientX: 150, clientY: 100, pointerType: 'mouse' });
    pane.querySelector('img').dispatchEvent(move);
    expect(pane.style.getPropertyValue('--plt-zoom-x')).toBe('25%');
    expect(pane.style.getPropertyValue('--plt-zoom-y')).toBe('50%');
    pane.dispatchEvent(new Event('pointerleave'));
    expect(pane.style.getPropertyValue('--plt-zoom-x')).toBe('');
  });

  it('ignores touch pointers for zoom', () => {
    const { gallery } = q();
    const pane = gallery.querySelector('[data-plt-gallery-zoom]');
    const move = new Event('pointermove', { bubbles: true });
    Object.assign(move, { clientX: 1, clientY: 1, pointerType: 'touch' });
    pane.dispatchEvent(move);
    expect(pane.style.getPropertyValue('--plt-zoom-x')).toBe('');
  });

  it('opens the lightbox from the zoom link and cancels the navigation, then closes', () => {
    const { gallery, dialog } = q();
    const opener = gallery.querySelector('[data-plt-gallery-zoom-open]');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    opener.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(true);
    const image = dialog.querySelector('img');
    expect(image.getAttribute('src')).toBe('a-large.jpg');
    expect(image.alt).toBe('A large');
    expect(dialog.getAttribute('aria-label')).toBe('A large');

    gallery.querySelector('[data-plt-gallery-lightbox-close]').click();
    expect(dialog.open).toBe(false);
    expect(image.hasAttribute('src')).toBe(false);
  });

  it('lets the zoom link navigate when there is no dialog', () => {
    const { gallery, dialog } = q();
    dialog.remove();
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    gallery.querySelector('[data-plt-gallery-zoom-open]').dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
  });

  it('pages the thumbnail track', () => {
    const { gallery } = q();
    const track = gallery.querySelector('[data-plt-gallery-thumb-track]');
    const calls = [];
    track.scrollBy = (o) => calls.push(o);
    gallery.querySelector('[data-plt-gallery-thumbs-next]').click();
    expect(calls).toHaveLength(1);
    expect(calls[0].left).toBeGreaterThanOrEqual(0);
  });

  it('keeps arrow keys working between slide thumbnails', () => {
    const { thumbs, slides } = q();
    thumbs[0].focus();
    thumbs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    expect(slides[1].hidden).toBe(false);
    expect(document.activeElement).toBe(thumbs[1]);
  });
});
