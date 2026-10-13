/**
 * Helpers shared by every PLT Web Component. No platform imports.
 */
/** Lit converter for JSON attributes; malformed JSON falls back instead of throwing. */
export declare const jsonConverter: (tag: string, fallback: () => unknown) => {
    fromAttribute(value: string | null): any;
    toAttribute(value: unknown): string;
};
/**
 * Hides and disables server-rendered children marked `data-plt-fallback`, so
 * the no-JavaScript markup neither shows nor submits once the element renders.
 */
export declare function retireFallback(host: HTMLElement): void;
/** Dispatches a bubbling, composed `CustomEvent`; returns `false` when cancelled. */
export declare function emit<T>(target: EventTarget, type: string, detail: T, cancelable?: boolean): boolean;
/**
 * Registers a custom element once. No-op without a registry (server) and when
 * another bundle already registered the tag.
 */
export declare function defineOnce(tag: string, constructor: CustomElementConstructor, registry?: CustomElementRegistry | undefined): boolean;
/** Page-unique id for label/control wiring. */
export declare const nextId: (prefix: string) => string;
/** Reference-counted page scroll lock shared by modal components. */
export declare function lockScroll(): () => void;
/** Element with this id inside `host` (no selector escaping needed). */
export declare function byId<T extends HTMLElement = HTMLElement>(host: ParentNode & Node, id: string | null | undefined): T | null;
