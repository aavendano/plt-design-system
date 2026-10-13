/**
 * Hydrogen-style product form (consumer). It keeps what Hydrogen keeps:
 * Storefront data, price display, cart lines and navigation. The picker is the
 * shared Lit element through the minimal React adapter — not a React rewrite.
 */
import { useMemo, useState } from "react";
import { PltVariantPicker } from "../../src/react/variant-picker";
import { fromStorefrontProduct } from "../../src/variant-picker/storefront";
import type { PltVariantChangeDetail } from "../../src/variant-picker/types";
import { storefrontProduct } from "../../tests/fixtures/product.mjs";

const product = storefrontProduct();

export function App() {
  const picker = useMemo(() => fromStorefrontProduct(product), []);
  const [selectedVariantId, setSelectedVariantId] = useState(picker.selectedVariantId);
  const [lastEvent, setLastEvent] = useState("");
  const variant = product.variants.nodes.find((node) => node.id === selectedVariantId) ?? null;
  const canBuy = Boolean(variant?.availableForSale);

  function onVariantChange(detail: PltVariantChangeDetail) {
    setSelectedVariantId(detail.variantId);
    setLastEvent(
      `plt:variant-change ${JSON.stringify({
        variantId: detail.variantId,
        available: detail.available,
        selectedOptions: detail.selectedOptions,
      })}`,
    );
    // Hydrogen would call navigate(`?${variantUriQuery}`, {replace: true}).
    const url = new URL(window.location.href);
    for (const { name, value } of detail.selectedOptions) url.searchParams.set(name, value);
    window.history.replaceState(null, "", url);
  }

  return (
    <main className="demo-shell" data-frontend="react">
      <header>
        <p className="d-badge d-badge-secondary theme-label-bold">Hydrogen React</p>
        <h1 className="theme-headline-lg">{product.title}</h1>
        <p className="plt-product-detail__price" data-price>
          {variant ? `$${variant.price.amount}` : "—"}
        </p>
      </header>
      <form className="grid gap-6" onSubmit={(event) => event.preventDefault()}>
        <PltVariantPicker
          options={picker.options}
          variants={picker.variants}
          selectedVariantId={picker.selectedVariantId}
          name="merchandiseId"
          labels={LABELS}
          fallbackLabel="Variant"
          onVariantChange={onVariantChange}
        />
        <button
          type="submit"
          className="d-btn d-btn-primary theme-bordered theme-elevated theme-label-bold"
          data-add-to-cart
          disabled={!canBuy}
        >
          {canBuy ? "Add to cart" : variant ? "Sold out" : "Unavailable"}
        </button>
      </form>
      <output className="demo-log" data-log>
        {lastEvent}
      </output>
    </main>
  );
}

const LABELS = { soldOut: "Sold out", unavailable: "Unavailable" };
