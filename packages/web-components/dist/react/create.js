import {
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef
} from "react";
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const loaded = /* @__PURE__ */ new Map();
function createComponent(config) {
  const { tag, load, properties = [], attributes = {}, events = {}, fallback } = config;
  const Component = forwardRef(function PltComponent(rawProps, forwarded) {
    const props = rawProps;
    const ref = useRef(null);
    useImperativeHandle(forwarded, () => ref.current, []);
    const latest = useRef(props);
    latest.current = props;
    useIsomorphicLayoutEffect(() => {
      const element = ref.current;
      if (!element) return;
      for (const key of properties) {
        const value = props[key];
        if (value !== void 0) element[key] = value;
      }
    }, properties.map((key) => props[key]));
    useEffect(() => {
      if (!loaded.has(tag)) loaded.set(tag, load());
      const element = ref.current;
      if (!element) return;
      const listeners = Object.entries(events).map(([prop, type]) => {
        const listener = (event) => {
          const callback = latest.current[prop];
          if (typeof callback === "function") callback(event.detail, event);
        };
        element.addEventListener(type, listener);
        return () => element.removeEventListener(type, listener);
      });
      return () => listeners.forEach((remove) => remove());
    }, []);
    const attrs = {
      ref,
      className: props.className,
      id: props.id,
      suppressHydrationWarning: true
    };
    for (const [prop, attribute] of Object.entries(attributes)) {
      const value = props[prop];
      if (value === void 0 || value === null || value === false) continue;
      attrs[attribute] = value === true ? "" : String(value);
    }
    return createElement(tag, attrs, props.children ?? fallback?.(props) ?? null);
  });
  Component.displayName = tag;
  return Component;
}
export {
  createComponent
};
