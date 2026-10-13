/**
 * Minimal React bridge for PLT Web Components (React 18 and 19).
 *
 * One generic adapter instead of a React port per component: it renders the
 * custom element, passes arrays/objects as DOM properties, mirrors simple
 * values as attributes (so server HTML carries them), forwards DOM events to
 * callbacks and registers the element lazily on the client, so server
 * rendering never touches `customElements`.
 */
import { type ForwardRefExoticComponent, type ReactNode, type RefAttributes } from "react";
export interface AdapterConfig<P> {
    tag: string;
    /** Lazily imports the element's define module (client only). */
    load: () => Promise<unknown>;
    /** Props set as DOM properties after render (arrays, objects, numbers). */
    properties?: ReadonlyArray<keyof P & string>;
    /** Props mirrored as attributes, for server HTML: prop → attribute name. */
    attributes?: Partial<Record<keyof P & string, string>>;
    /** Callback props → DOM event names; the callback receives `(detail, event)`. */
    events?: Partial<Record<keyof P & string, string>>;
    /** No-JS fallback rendered as children when the consumer passes none. */
    fallback?: (props: P) => ReactNode;
}
export interface BaseProps {
    className?: string;
    id?: string;
    children?: ReactNode;
}
export declare function createComponent<P extends BaseProps, E extends HTMLElement = HTMLElement>(config: AdapterConfig<P>): ForwardRefExoticComponent<P & RefAttributes<E>>;
