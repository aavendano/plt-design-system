/**
 * Demo consumer code for the vanilla frontends (the Liquid theme and the
 * Astro page). In production this lives in each frontend: it owns prices,
 * the cart and navigation, and only talks to the Web Components through
 * properties, methods and DOM events.
 */
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

export function mountStore() {
  const data = JSON.parse(document.getElementById("demo-data").textContent);
  const logEl = document.querySelector("[data-log]");
  const log = (text) => (logEl.textContent = text);

  // --- Cart (in memory; a real theme calls /cart/change.js) -----------------
  const drawer = document.querySelector("plt-cart-drawer");
  const cartButton = document.querySelector("[data-cart-open]");
  const unit = { ...data.unitPrices };
  let lines = data.cartLines.map((line) => ({ ...line }));
  const renderCart = () => {
    lines = lines.map((line) => ({ ...line, price: money(unit[line.id] * line.quantity) }));
    drawer.lines = lines;
    drawer.subtotal = money(lines.reduce((sum, line) => sum + unit[line.id] * line.quantity, 0));
    cartButton.textContent = `${data.labels.cart} (${lines.reduce((sum, line) => sum + line.quantity, 0)})`;
  };
  const mutate = (change) => {
    drawer.busy = true;
    setTimeout(() => {
      change();
      drawer.busy = false;
      renderCart();
    }, 120);
  };
  cartButton.addEventListener("click", () => drawer.show());
  drawer.addEventListener("plt:cart-line-change", (event) => {
    const { lineId, quantity } = event.detail;
    log(`plt:cart-line-change ${JSON.stringify(event.detail)}`);
    mutate(() => (lines = lines.map((line) => (line.id === lineId ? { ...line, quantity } : line))));
  });
  drawer.addEventListener("plt:cart-line-remove", (event) => {
    log(`plt:cart-line-remove ${JSON.stringify(event.detail)}`);
    mutate(() => (lines = lines.filter((line) => line.id !== event.detail.lineId)));
  });

  // --- Product page ---------------------------------------------------------
  const pdp = document.querySelector("[data-pdp]");
  const gallery = pdp.querySelector("plt-product-gallery");
  const quantity = pdp.querySelector("plt-quantity-selector");
  const button = pdp.querySelector("[data-add-to-cart]");
  const price = pdp.querySelector("[data-price]");
  let variant = data.variants[data.initialVariantId];
  pdp.addEventListener("plt:variant-change", (event) => {
    const { variantId, available, selectedOptions } = event.detail;
    variant = variantId ? data.variants[variantId] : null;
    price.textContent = variant ? money(variant.cents) : "—";
    button.disabled = !available;
    button.textContent = available ? data.labels.add : variantId ? data.labels.soldOut : data.labels.unavailable;
    // The page decides which image belongs to a variant.
    const color = selectedOptions.find((option) => option.name === "Color")?.value;
    const index = data.images.findIndex((image) => image.color === color);
    if (index >= 0) gallery.select(index);
    const url = new URL(location.href);
    for (const { name, value } of selectedOptions) url.searchParams.set(name, value);
    history.replaceState(null, "", url);
    log(`plt:variant-change ${JSON.stringify({ variantId, available, selectedOptions })}`);
  });
  pdp.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!variant?.available) return;
    const id = `line-${variant.id}`;
    const count = quantity.value;
    unit[id] = variant.cents;
    const existing = lines.find((line) => line.id === id);
    lines = existing
      ? lines.map((line) => (line.id === id ? { ...line, quantity: line.quantity + count } : line))
      : [...lines, { id, title: data.title, url: "#pdp", imageUrl: data.images[gallery.selectedIndex]?.src ?? null, imageAlt: "", variantTitle: variant.title, quantity: count, price: "", compareAtPrice: null }];
    renderCart();
    drawer.show();
  });

  // --- Collection: client routing, or the components' default navigation ----
  for (const type of ["plt:filter-change", "plt:sort-change", "plt:page-change"]) {
    document.addEventListener(type, (event) => {
      log(`${type} ${JSON.stringify(event.detail)}`);
      if (data.collectionMode !== "client") return;
      event.preventDefault();
      const url = new URL(location.href);
      if (type === "plt:filter-change") url.search = event.detail.query;
      if (type === "plt:sort-change") url.searchParams.set(event.detail.name, event.detail.value);
      if (type === "plt:page-change") url.search = new URL(event.detail.url, url).search;
      history.replaceState(null, "", url);
    });
  }

  renderCart();
}
