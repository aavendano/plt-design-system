(function () {
  const MOCK_PRODUCTS = {
    "product-handle-1": {
      title: "Velvet Pulse",
      price: "$48.00",
      vendor: "PLT Essentials",
      badge: "New",
    },
    "product-handle-2": {
      title: "Midnight Bloom",
      price: "$62.00",
      vendor: "PLT Essentials",
      badge: "Bestseller",
    },
    "product-handle-3": {
      title: "Silk Current",
      price: "$54.00",
      vendor: "PLT Essentials",
    },
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function readProps(island) {
    const script = island.querySelector("script[data-plt-props]");
    if (!script) {
      return {};
    }

    try {
      return JSON.parse(script.textContent.trim());
    } catch (error) {
      console.warn("Invalid PLT island props", island, error);
      return {};
    }
  }

  function titleFromHandle(handle) {
    return handle
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function renderHero(props) {
    const heading = escapeHtml(props.heading ?? "Hero heading");
    const body = props.body ? `<div class="theme-body-lg">${escapeHtml(props.body)}</div>` : "";
    const primary =
      props.primaryLabel && props.primaryUrl
        ? `<a class="d-btn d-btn-primary d-btn-lg theme-bordered theme-elevated theme-label-bold" href="${escapeHtml(props.primaryUrl)}">${escapeHtml(props.primaryLabel)}</a>`
        : "";
    const secondary =
      props.secondaryLabel && props.secondaryUrl
        ? `<a class="d-btn d-btn-outline d-btn-lg theme-bordered theme-elevated theme-label-bold" href="${escapeHtml(props.secondaryUrl)}">${escapeHtml(props.secondaryLabel)}</a>`
        : "";

    return `
      <section class="d-hero plt-hero">
        <div class="d-hero-content plt-hero__content">
          <div class="plt-hero__copy">
            <h1 class="theme-headline-lg">${heading}</h1>
            ${body}
            <div class="plt-hero__actions">${primary}${secondary}</div>
          </div>
        </div>
      </section>
    `;
  }

  function renderProductCard(handle, index) {
    const product = MOCK_PRODUCTS[handle] ?? {
      title: titleFromHandle(handle),
      price: `$${(39 + index * 7).toFixed(2)}`,
      vendor: "PLT Essentials",
    };
    const badge = product.badge
      ? `<span class="d-badge d-badge-secondary theme-label-bold">${escapeHtml(product.badge)}</span>`
      : "";

    return `
      <article class="d-card bg-base-100 theme-bordered theme-elevated plt-media-card plt-product-card">
        <div class="plt-media-card__media plt-island-preview__media" aria-hidden="true"></div>
        <div class="d-card-body plt-media-card__body">
          ${badge}
          <h3 class="d-card-title theme-headline-sm plt-media-card__title">${escapeHtml(product.title)}</h3>
          <p class="theme-meta plt-media-card__meta">${escapeHtml(product.vendor ?? "PLT")}</p>
          <div class="d-card-actions plt-media-card__actions">
            <span class="plt-product-card__price">${escapeHtml(product.price)}</span>
            <a class="d-btn d-btn-secondary d-btn-sm theme-bordered theme-elevated theme-label-bold" href="#">Add to cart</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderProductGrid(props) {
    const title = props.title ? `<h2 class="theme-headline-md plt-section__title">${escapeHtml(props.title)}</h2>` : "";
    const products = Array.isArray(props.products) ? props.products : [];
    const cards = products.map((handle, index) => renderProductCard(handle, index)).join("");

    return `
      <section class="plt-section plt-island-preview__section">
        ${title}
        <div class="plt-product-grid plt-product-grid--cols-3">${cards}</div>
      </section>
    `;
  }

  function renderNewsletter(props) {
    const heading = escapeHtml(props.heading ?? "Newsletter");
    const body = props.body ? `<p class="theme-body-lg">${escapeHtml(props.body)}</p>` : "";
    const placeholder = escapeHtml(props.placeholder ?? props.inputPlaceholder ?? "Email address");
    const buttonLabel = escapeHtml(props.buttonLabel ?? props.actionLabel ?? "Subscribe");

    return `
      <section class="plt-newsletter">
        <div class="d-card bg-base-100 theme-bordered theme-elevated plt-newsletter__card">
          <div class="d-card-body plt-newsletter__content">
            <h2 class="d-card-title theme-headline-lg">${heading}</h2>
            ${body}
            <form class="plt-newsletter__form" action="#" method="post">
              <input class="d-input" type="email" name="email" placeholder="${placeholder}" required />
              <button class="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold" type="button">${buttonLabel}</button>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  const renderers = {
    Hero: renderHero,
    ProductGrid: renderProductGrid,
    Newsletter: renderNewsletter,
  };

  function hydrateIsland(island) {
    const component = island.getAttribute("data-plt-island");
    const render = renderers[component];
    if (!render) {
      return;
    }

    const props = readProps(island);
    const preview = document.createElement("div");
    preview.className = "plt-island-preview";
    preview.setAttribute("data-theme", "brand");
    preview.innerHTML = render(props);
    island.replaceChildren(preview);
  }

  function init() {
    document.querySelectorAll("[data-plt-island]").forEach(hydrateIsland);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
