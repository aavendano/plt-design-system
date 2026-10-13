/**
 * Helpers shared by every PLT Web Component. No platform imports.
 */

/** Lit converter for JSON attributes; malformed JSON falls back instead of throwing. */
export const jsonConverter = (tag: string, fallback: () => unknown) => ({
  fromAttribute(value: string | null) {
    if (value === null || value === "") return fallback();
    try {
      return JSON.parse(value);
    } catch {
      console.warn(`<${tag}>: ignoring malformed JSON attribute`);
      return fallback();
    }
  },
  toAttribute(value: unknown) {
    return JSON.stringify(value);
  },
});

/**
 * Hides and disables server-rendered children marked `data-plt-fallback`, so
 * the no-JavaScript markup neither shows nor submits once the element renders.
 */
export function retireFallback(host: HTMLElement): void {
  const controls = "input, select, textarea, button";
  for (const fallback of host.querySelectorAll<HTMLElement>(":scope > [data-plt-fallback]")) {
    fallback.hidden = true;
    if (fallback.matches(controls)) (fallback as HTMLInputElement).disabled = true;
    for (const control of fallback.querySelectorAll<HTMLInputElement>(controls)) {
      control.disabled = true;
    }
  }
}

/** Dispatches a bubbling, composed `CustomEvent`; returns `false` when cancelled. */
export function emit<T>(target: EventTarget, type: string, detail: T, cancelable = false): boolean {
  return target.dispatchEvent(new CustomEvent<T>(type, { detail, bubbles: true, composed: true, cancelable }));
}

/**
 * Registers a custom element once. No-op without a registry (server) and when
 * another bundle already registered the tag.
 */
export function defineOnce(
  tag: string,
  constructor: CustomElementConstructor,
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): boolean {
  if (!registry) return false;
  if (!registry.get(tag)) registry.define(tag, constructor);
  return true;
}

let uid = 0;
/** Page-unique id for label/control wiring. */
export const nextId = (prefix: string) => `${prefix}-${++uid}`;

let locks = 0;
let previousOverflow = "";
/** Reference-counted page scroll lock shared by modal components. */
export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  if (locks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  locks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) document.body.style.overflow = previousOverflow;
  };
}

/** Element with this id inside `host` (no selector escaping needed). */
export function byId<T extends HTMLElement = HTMLElement>(host: ParentNode & Node, id: string | null | undefined): T | null {
  if (!id) return null;
  const fromDocument = host.ownerDocument?.getElementById(id);
  if (fromDocument && host.contains(fromDocument)) return fromDocument as T;
  for (const element of host.querySelectorAll<T>("[id]")) if (element.id === id) return element;
  return null;
}
