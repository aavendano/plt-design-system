/**
 * Minimal React bridge for PLT Web Components (React 18 and 19).
 *
 * One generic adapter instead of a React port per component: it renders the
 * custom element, passes arrays/objects as DOM properties, mirrors simple
 * values as attributes (so server HTML carries them), forwards DOM events to
 * callbacks and registers the element lazily on the client, so server
 * rendering never touches `customElements`.
 */
import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

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

const loaded = new Map<string, Promise<unknown>>();

export function createComponent<P extends BaseProps, E extends HTMLElement = HTMLElement>(
  config: AdapterConfig<P>,
): ForwardRefExoticComponent<P & RefAttributes<E>> {
  const { tag, load, properties = [], attributes = {}, events = {}, fallback } = config;

  const Component = forwardRef<E, P>(function PltComponent(rawProps, forwarded) {
    const props = rawProps as P;
    const ref = useRef<E | null>(null);
    useImperativeHandle(forwarded, () => ref.current as E, []);
    const latest = useRef(props);
    latest.current = props;

    useIsomorphicLayoutEffect(() => {
      const element = ref.current as unknown as Record<string, unknown> | null;
      if (!element) return;
      for (const key of properties) {
        const value = props[key];
        if (value !== undefined) element[key] = value;
      }
    }, properties.map((key) => props[key]));

    useEffect(() => {
      if (!loaded.has(tag)) loaded.set(tag, load());
      const element = ref.current;
      if (!element) return;
      const listeners = Object.entries(events).map(([prop, type]) => {
        const listener = (event: Event) => {
          const callback = latest.current[prop as keyof P] as unknown;
          if (typeof callback === "function") callback((event as CustomEvent).detail, event);
        };
        element.addEventListener(type as string, listener);
        return () => element.removeEventListener(type as string, listener);
      });
      return () => listeners.forEach((remove) => remove());
    }, []);

    const attrs: Record<string, unknown> = {
      ref,
      className: props.className,
      id: props.id,
      suppressHydrationWarning: true,
    };
    for (const [prop, attribute] of Object.entries(attributes)) {
      const value = props[prop as keyof P] as unknown;
      if (value === undefined || value === null || value === false) continue;
      attrs[attribute as string] = value === true ? "" : String(value);
    }
    return createElement(tag, attrs, props.children ?? fallback?.(props) ?? null);
  });
  Component.displayName = tag;
  return Component as ForwardRefExoticComponent<P & RefAttributes<E>>;
}
