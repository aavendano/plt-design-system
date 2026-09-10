export type EditorialAction = {
  label: string;
  href: string;
};

export type HeroBlock = {
  type: "hero";
  title: string;
  description?: string;
  image?: string;
  actions?: EditorialAction[];
};

export type PromoStripBlock = {
  type: "promo_strip";
  title: string;
  description?: string;
  action?: EditorialAction;
};

export type NewsletterBlock = {
  type: "newsletter";
  title: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
};

export type ProductGridBlock = {
  type: "product_grid";
  title?: string;
  products: string[];
};

export type RichTextBlock = {
  type: "rich_text";
  body: string;
};

export type EditorialBlock =
  | HeroBlock
  | PromoStripBlock
  | NewsletterBlock
  | ProductGridBlock
  | RichTextBlock;

export type EditorialPage = {
  title: string;
  slug: string;
  locale?: string;
  blocks: EditorialBlock[];
};

export type HydrationMode = "load" | "idle" | "visible" | "interaction";

export type HydratableComponent =
  | "Hero"
  | "PromoStrip"
  | "Newsletter"
  | "ProductGrid"
  | "ProductCard"
  | "CollectionCard"
  | "SearchField"
  | "FilterBar"
  | "SortSelect"
  | "Pagination"
  | "EmptyState";

export type HydrationIsland<TData extends Record<string, unknown> = Record<string, unknown>> = {
  component: HydratableComponent;
  id: string;
  hydrate: HydrationMode;
  data: TData;
};
