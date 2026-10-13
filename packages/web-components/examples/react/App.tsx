/**
 * Hydrogen-style storefront (consumer). React keeps what Hydrogen keeps:
 * Storefront data, prices, cart state and navigation. Every interactive piece
 * is a shared PLT Web Component through the React adapters — no React ports.
 * Markup for the enhanced components (navbar, gallery, quick view) follows the
 * design-system contracts, as Hydrogen's own renderers do.
 */
import { useMemo, useRef, useState } from "react";
import {
  PltCartDrawer,
  PltFilterBar,
  PltNavbar,
  PltPagination,
  PltProductGallery,
  PltQuantitySelector,
  PltQuickView,
  PltSortSelect,
} from "../../src/react/components";
import { PltVariantPicker } from "../../src/react/variant-picker";
import { fromStorefrontProduct } from "../../src/variant-picker/storefront";
import type { PltVariantChangeDetail } from "../../src/variant-picker/types";
import type { PltCartLineData } from "../../src/cart/types";
import { storefrontProduct } from "../../tests/fixtures/product.mjs";
import * as demo from "../../tests/fixtures/demo.mjs";

const product = storefrontProduct();
const LABELS = { soldOut: "Sold out", unavailable: "Unavailable" };
const centsOf = (amount: string) => Math.round(Number(amount) * 100);

type Element = HTMLElement & Record<string, any>;

export function App() {
  const picker = useMemo(() => fromStorefrontProduct(product), []);
  const [variantId, setVariantId] = useState<string | null>(picker.selectedVariantId);
  const [lines, setLines] = useState<PltCartLineData[]>(demo.cartLines);
  const [unit, setUnit] = useState<Record<string, number>>({ ...demo.unitPrices });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastEvent, setLastEvent] = useState("");
  const gallery = useRef<Element>(null);
  const quantity = useRef<Element>(null);

  const variant = product.variants.nodes.find((node) => node.id === variantId) ?? null;
  const canBuy = Boolean(variant?.availableForSale);
  const priced = lines.map((line) => ({ ...line, price: demo.money(unit[line.id] * line.quantity) }));
  const subtotal = demo.money(lines.reduce((sum, line) => sum + unit[line.id] * line.quantity, 0));
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  const replaceUrl = (mutate: (url: URL) => void) => {
    const url = new URL(window.location.href);
    mutate(url);
    window.history.replaceState(null, "", url);
  };
  const report = (type: string, detail: unknown) => setLastEvent(`${type} ${JSON.stringify(detail)}`);

  function onVariantChange(detail: PltVariantChangeDetail) {
    setVariantId(detail.variantId);
    const color = detail.selectedOptions.find((option) => option.name === "Color")?.value;
    const index = demo.images.findIndex((image) => image.color === color);
    if (index >= 0) gallery.current?.select(index);
    // Hydrogen would navigate(`?${variantUriQuery}`, {replace: true}).
    replaceUrl((url) => detail.selectedOptions.forEach(({ name, value }) => url.searchParams.set(name, value)));
    report("plt:variant-change", { variantId: detail.variantId, available: detail.available, selectedOptions: detail.selectedOptions });
  }

  function mutate(change: () => void) {
    setBusy(true);
    setTimeout(() => {
      change();
      setBusy(false);
    }, 120);
  }

  function addToCart(event: React.FormEvent) {
    event.preventDefault();
    if (!variant || !canBuy) return;
    const id = `line-${variant.id}`;
    const qty = Number(quantity.current?.value ?? 1);
    setUnit((prices) => ({ ...prices, [id]: centsOf(variant.price.amount) }));
    setLines((current) =>
      current.some((line) => line.id === id)
        ? current.map((line) => (line.id === id ? { ...line, quantity: line.quantity + qty } : line))
        : [
            ...current,
            {
              id,
              title: product.title,
              url: "#pdp",
              imageUrl: demo.images[gallery.current?.selectedIndex ?? 0]?.src ?? null,
              imageAlt: "",
              variantTitle: variant.title,
              quantity: qty,
              price: "",
              compareAtPrice: null,
            },
          ],
    );
    setOpen(true);
  }

  // Client routing for the collection controls (Hydrogen would navigate()).
  const route = (type: string) => (detail: any, event: CustomEvent) => {
    event.preventDefault();
    report(type, detail);
    replaceUrl((url) => {
      if (type === "plt:filter-change") url.search = detail.query;
      if (type === "plt:sort-change") url.searchParams.set(detail.name, detail.value);
      if (type === "plt:page-change") url.search = new URL(detail.url, url).search;
    });
  };

  return (
    <>
      <PltNavbar>
        <header className="d-navbar plt-navbar" data-plt-navbar>
          <div className="plt-navbar__inner">
            <div className="d-navbar-start gap-2">
              <button type="button" className="d-btn d-btn-ghost d-btn-square plt-navbar__menu-toggle" data-plt-navbar-toggle aria-expanded="false" aria-controls="plt-navbar-mobile" aria-label="Open menu">
                <span aria-hidden="true">☰</span>
              </button>
              <a className="d-btn d-btn-ghost plt-navbar__brand" href="/" aria-label="PlayLoveToys">
                <span className="theme-headline-sm">PlayLoveToys</span>
              </a>
            </div>
            <div className="d-navbar-center plt-navbar__links">
              <ul className="d-menu d-menu-horizontal px-0">
                {demo.navLinks.map((link, index) => (
                  <li key={link.url}>
                    <a
                      className="theme-label-bold"
                      href={link.url}
                      {...(link.columns ? { "aria-haspopup": "true", "aria-expanded": "false", "aria-controls": `plt-megamenu-${index}` } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {demo.navLinks.map((link, index) =>
                link.columns ? (
                  <div key={link.url} className="plt-megamenu" id={`plt-megamenu-${index}`} data-open="false" role="region" aria-label={link.label}>
                    <div className="plt-megamenu__inner">
                      {link.columns.map((column) => (
                        <div key={column.url} className="plt-megamenu__column">
                          <a className="plt-megamenu__title theme-label-bold" href={column.url}>{column.title}</a>
                          <ul className="plt-megamenu__list">
                            {column.children.map((child) => (
                              <li key={child.url}><a className="plt-megamenu__link" href={child.url}>{child.label}</a></li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
            <div className="d-navbar-end plt-navbar__actions">
              <button type="button" className="d-btn d-btn-ghost theme-label-bold" data-cart-open onClick={() => setOpen(true)}>
                Cart ({count})
              </button>
            </div>
          </div>
          <div className="plt-navbar__mobile" id="plt-navbar-mobile" data-open="false" hidden>
            <ul className="d-menu w-full">
              {demo.navLinks.map((link) => (
                <li key={link.url}>
                  <a className="theme-label-bold" href={link.url}>{link.label}</a>
                  {link.columns ? (
                    <ul>
                      {link.columns.map((column) => (
                        <li key={column.url}>
                          <a href={column.url}>{column.title}</a>
                          <ul>
                            {column.children.map((child) => (
                              <li key={child.url}><a href={child.url}>{child.label}</a></li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="plt-navbar__actions"></div>
          </div>
        </header>
      </PltNavbar>

      <main className="demo-shell" data-frontend="react">
        <section className="plt-product-detail" id="pdp" data-pdp>
          <PltProductGallery className="plt-product-detail__gallery" ref={gallery}>
            <div className="plt-product-detail__gallery-main">
              <img src={demo.images[0].src} alt={demo.images[0].alt} width={400} height={400} />
            </div>
            <div className="plt-product-detail__thumbs">
              {demo.images.map((image, index) => (
                <button key={image.src} type="button" className="plt-product-detail__thumb" aria-label={image.alt} aria-current={index === 0 ? "true" : undefined}>
                  <img src={image.src} alt="" width={80} height={80} />
                </button>
              ))}
            </div>
          </PltProductGallery>
          <form className="plt-product-detail__buybox" onSubmit={addToCart}>
            <p className="d-badge d-badge-secondary theme-label-bold">Hydrogen React</p>
            <h1 className="theme-headline-lg">{product.title}</h1>
            <p className="plt-product-detail__price" data-price>
              {variant ? demo.money(centsOf(variant.price.amount)) : "—"}
            </p>
            <PltVariantPicker
              options={picker.options}
              variants={picker.variants}
              selectedVariantId={picker.selectedVariantId}
              name="merchandiseId"
              labels={LABELS}
              fallbackLabel="Variant"
              onVariantChange={onVariantChange}
            />
            <div className="plt-product-detail__actions">
              <PltQuantitySelector ref={quantity} value={1} max={10} />
              <button type="submit" className="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold" data-add-to-cart disabled={!canBuy}>
                {canBuy ? "Add to cart" : variant ? "Sold out" : "Unavailable"}
              </button>
            </div>
          </form>
        </section>

        <section className="plt-collection" id="collection" data-collection>
          <h2 className="theme-headline-sm">Collection</h2>
          <div className="plt-collection-controls">
            <PltFilterBar filters={demo.filters} onFilterChange={route("plt:filter-change")} />
            <PltSortSelect options={demo.sortOptions} name="sort_by" onSortChange={route("plt:sort-change")} />
          </div>
          <ul className="demo-grid">
            {demo.cards.map((card, index) => (
              <li key={card.title}>
                <article className="d-card bg-base-100 theme-bordered">
                  <div className="d-card-body">
                    <h3 className="d-card-title theme-headline-sm">{card.title}</h3>
                    <PltQuickView>
                      <button type="button" className="d-btn d-btn-outline theme-bordered theme-label-bold" data-quick-view-open>Quick view</button>
                      <dialog className="d-modal" aria-labelledby={`qv-${index + 1}`}>
                        <div className="d-modal-box theme-bordered">
                          <h3 className="theme-headline-sm" id={`qv-${index + 1}`}>{card.title}</h3>
                          <p>{card.body}</p>
                          <form method="dialog"><button className="d-btn d-btn-sm d-btn-outline theme-bordered" data-quick-view-close>Close</button></form>
                        </div>
                      </dialog>
                    </PltQuickView>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <PltPagination pages={demo.pages} nextUrl={demo.nextUrl} onPageChange={route("plt:page-change")} />
        </section>
        <output className="demo-log" data-log>{lastEvent}</output>
      </main>

      <PltCartDrawer
        id="plt-cart-drawer"
        open={open}
        lines={priced}
        subtotal={subtotal}
        checkoutUrl="/checkout"
        cartUrl="/cart"
        busy={busy}
        onClose={() => setOpen(false)}
        onLineChange={(detail) => {
          report("plt:cart-line-change", detail);
          mutate(() => setLines((current) => current.map((line) => (line.id === detail.lineId ? { ...line, quantity: detail.quantity } : line))));
        }}
        onLineRemove={(detail) => {
          report("plt:cart-line-remove", detail);
          mutate(() => setLines((current) => current.filter((line) => line.id !== detail.lineId)));
        }}
      />
    </>
  );
}
