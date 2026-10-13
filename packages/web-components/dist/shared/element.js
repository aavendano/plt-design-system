const jsonConverter = (tag, fallback) => ({
  fromAttribute(value) {
    if (value === null || value === "") return fallback();
    try {
      return JSON.parse(value);
    } catch {
      console.warn(`<${tag}>: ignoring malformed JSON attribute`);
      return fallback();
    }
  },
  toAttribute(value) {
    return JSON.stringify(value);
  }
});
function retireFallback(host) {
  const controls = "input, select, textarea, button";
  for (const fallback of host.querySelectorAll(":scope > [data-plt-fallback]")) {
    fallback.hidden = true;
    if (fallback.matches(controls)) fallback.disabled = true;
    for (const control of fallback.querySelectorAll(controls)) {
      control.disabled = true;
    }
  }
}
function emit(target, type, detail, cancelable = false) {
  return target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable }));
}
function defineOnce(tag, constructor, registry = globalThis.customElements) {
  if (!registry) return false;
  if (!registry.get(tag)) registry.define(tag, constructor);
  return true;
}
let uid = 0;
const nextId = (prefix) => `${prefix}-${++uid}`;
let locks = 0;
let previousOverflow = "";
function lockScroll() {
  if (typeof document === "undefined") return () => {
  };
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
function byId(host, id) {
  if (!id) return null;
  const fromDocument = host.ownerDocument?.getElementById(id);
  if (fromDocument && host.contains(fromDocument)) return fromDocument;
  for (const element of host.querySelectorAll("[id]")) if (element.id === id) return element;
  return null;
}
export {
  byId,
  defineOnce,
  emit,
  jsonConverter,
  lockScroll,
  nextId,
  retireFallback
};
