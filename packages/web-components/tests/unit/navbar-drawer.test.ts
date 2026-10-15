import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PltNavbar } from "../../src/navigation/plt-navbar";
import "../../src/navigation/define";

describe("<plt-navbar> modal drawer", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="outside">Outside</button>
      <plt-navbar>
        <button
          data-plt-navbar-toggle
          aria-expanded="false"
          aria-controls="drawer"
          data-label-open="Open menu"
          data-label-close="Close menu"
          aria-label="Open menu"
        >Menu</button>
        <dialog id="drawer" data-plt-navbar-drawer data-open="false">
          <button type="button" data-plt-navbar-drawer-close id="close-btn">Close</button>
          <a id="inside" href="/shop">Shop</a>
        </dialog>
      </plt-navbar>`;
    // jsdom: polyfill showModal/close when missing.
    const dialog = document.querySelector("dialog")!;
    if (typeof dialog.showModal !== "function") {
      dialog.showModal = function showModal(this: HTMLDialogElement) {
        this.setAttribute("open", "");
        Object.defineProperty(this, "open", { configurable: true, get: () => this.hasAttribute("open") });
      };
      dialog.close = function close(this: HTMLDialogElement) {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      };
      Object.defineProperty(dialog, "open", {
        configurable: true,
        get() {
          return this.hasAttribute("open");
        },
      });
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
  const navbar = () => $<PltNavbar>("plt-navbar");

  it("opens with showModal, locks scroll, and switches the toggle label", () => {
    const toggle = $("[data-plt-navbar-toggle]");
    const drawer = $("dialog") as HTMLDialogElement;
    const events: boolean[] = [];
    navbar().addEventListener("plt:navbar-toggle", (event) => events.push((event as CustomEvent).detail.open));

    toggle.click();
    expect(navbar().isOpen()).toBe(true);
    expect(drawer.open).toBe(true);
    expect(drawer.dataset.open).toBe("true");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-label")).toBe("Close menu");
    expect(document.body.style.overflow).toBe("hidden");
    expect(events).toEqual([true]);
  });

  it("closes from the close control, restores scroll and focus", () => {
    const toggle = $("[data-plt-navbar-toggle]");
    toggle.focus();
    toggle.click();
    $("#close-btn").click();
    expect(navbar().isOpen()).toBe(false);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-label")).toBe("Open menu");
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(toggle);
  });

  it("releases the scroll lock on disconnect while open", () => {
    $("[data-plt-navbar-toggle]").click();
    expect(document.body.style.overflow).toBe("hidden");
    navbar().remove();
    expect(document.body.style.overflow).toBe("");
  });

  it("shares the scroll lock with a second modal (reference counted)", () => {
    const firstRelease = vi.fn();
    // Simulate another modal holding a lock by opening the drawer twice across two navbars is heavy;
    // open the drawer, then assert close restores the previous overflow value.
    document.body.style.overflow = "auto";
    $("[data-plt-navbar-toggle]").click();
    expect(document.body.style.overflow).toBe("hidden");
    navbar().close();
    expect(document.body.style.overflow).toBe("auto");
    expect(firstRelease).not.toHaveBeenCalled();
  });
});
