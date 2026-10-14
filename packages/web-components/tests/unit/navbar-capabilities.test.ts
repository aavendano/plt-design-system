import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../src/navigation/define";

/** Opt-in capabilities of <plt-navbar>: hover intent, [data-plt-megamenu], published height, deferred images. */

const markup = (attributes = "") => `
  <button id="outside">Outside</button>
  <plt-navbar ${attributes}>
    <header>
      <button data-plt-navbar-toggle aria-expanded="false" aria-controls="mobile">Menu</button>
      <ul>
        <li><a id="a" href="/a" aria-haspopup="true" aria-expanded="false" aria-controls="panel-a"><span id="a-label">Alpha</span></a></li>
        <li><a id="b" href="/b" aria-haspopup="true" aria-expanded="false" aria-controls="panel-b">Beta</a></li>
      </ul>
      <div class="mega-menu-panel" data-plt-megamenu id="panel-a" data-open="false">
        <a id="a-link" href="/a/1">One</a>
        <img id="img-a" alt="" data-plt-navbar-deferred data-deferred-src="a.jpg" data-deferred-srcset="a.jpg 1x, a2.jpg 2x" data-deferred-sizes="200px">
      </div>
      <div class="mega-menu-panel" data-plt-megamenu id="panel-b" data-open="false"><a href="/b/1">Two</a></div>
      <div id="mobile" data-open="false" hidden><img id="img-m" alt="" data-plt-navbar-deferred data-deferred-src="m.jpg"></div>
    </header>
  </plt-navbar>`;

const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const over = (target: HTMLElement, relatedTarget: Element | null = null) =>
  target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse", relatedTarget }));
const out = (target: HTMLElement, relatedTarget: Element | null) =>
  target.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "mouse", relatedTarget }));
const open = (id: string) => $(`#${id}`).dataset.open;

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  document.documentElement.style.removeProperty("--plt-navbar-height");
});

describe("<plt-navbar> hover-delay", () => {
  it("opens a panel only after the hover has lasted that long", () => {
    document.body.innerHTML = markup('hover-delay="150"');
    over($("#a"));
    vi.advanceTimersByTime(149);
    expect(open("panel-a")).toBe("false");
    vi.advanceTimersByTime(1);
    expect(open("panel-a")).toBe("true");
    expect($("#a").getAttribute("aria-expanded")).toBe("true");
  });

  it("drops the open when the pointer leaves the trigger first, but not when it moves inside it", () => {
    document.body.innerHTML = markup('hover-delay="150"');
    over($("#a"));
    vi.advanceTimersByTime(100);
    // From the link to the span inside it: still on the same trigger.
    out($("#a"), $("#a-label"));
    over($("#a-label"));
    vi.advanceTimersByTime(49);
    expect(open("panel-a")).toBe("false");
    vi.advanceTimersByTime(1);
    expect(open("panel-a")).toBe("true"); // 150 ms after the first hover, not after the last move

    document.body.innerHTML = markup('hover-delay="150"');
    over($("#a"));
    vi.advanceTimersByTime(100);
    out($("#a"), $("#outside"));
    vi.advanceTimersByTime(500);
    expect(open("panel-a")).toBe("false");
  });

  it("keeps the open panel until the next one commits", () => {
    document.body.innerHTML = markup('hover-delay="150"');
    over($("#a"));
    vi.advanceTimersByTime(150);
    expect(open("panel-a")).toBe("true");
    out($("#a"), $("#b"));
    over($("#b"));
    vi.advanceTimersByTime(100);
    expect(open("panel-a")).toBe("true");
    expect(open("panel-b")).toBe("false");
    vi.advanceTimersByTime(50);
    expect(open("panel-a")).toBe("false");
    expect(open("panel-b")).toBe("true");
  });

  it("opens at once on focus and cancels a pending hover open", () => {
    document.body.innerHTML = markup('hover-delay="150"');
    over($("#a"));
    $("#b").focus();
    expect(open("panel-b")).toBe("true");
    vi.advanceTimersByTime(300);
    expect(open("panel-a")).toBe("false");
    expect(open("panel-b")).toBe("true");
  });

  it("opens at once without the attribute", () => {
    document.body.innerHTML = markup();
    over($("#a"));
    expect(open("panel-a")).toBe("true");
  });

  it("does not open from a pending hover after it is disconnected", () => {
    document.body.innerHTML = markup('hover-delay="150"');
    const panel = $("#panel-a");
    over($("#a"));
    $("plt-navbar").remove();
    vi.advanceTimersByTime(500);
    expect(panel.dataset.open).toBe("false");
  });
});

describe("<plt-navbar> [data-plt-megamenu]", () => {
  it("treats the attribute like the .plt-megamenu class for open, close and Escape", () => {
    document.body.innerHTML = markup();
    $("#a").focus();
    expect(open("panel-a")).toBe("true");
    $("#a-link").dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(open("panel-a")).toBe("false");
    $("#b").focus();
    $("#b").dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(document.querySelector("#panel-b a"));
    document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(open("panel-b")).toBe("false");
    expect(document.activeElement).toBe($("#b"));
  });

  it("does not take an element that is neither", () => {
    document.body.innerHTML = markup().replace('class="mega-menu-panel" data-plt-megamenu id="panel-a"', 'class="mega-menu-panel" id="panel-a"');
    $("#a").focus();
    expect(open("panel-a")).toBe("false");
  });
});

describe("<plt-navbar> publish-height", () => {
  class FakeObserver {
    static instances: FakeObserver[] = [];
    disconnected = false;
    constructor(public callback: () => void) {
      FakeObserver.instances.push(this);
    }
    observe() {}
    disconnect() {
      this.disconnected = true;
    }
  }

  beforeEach(() => {
    FakeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", FakeObserver);
  });

  const heightOf = (height: number) => vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ height } as DOMRect);

  it("keeps --plt-navbar-height on the element equal to its height", () => {
    const spy = heightOf(66);
    document.body.innerHTML = markup("publish-height");
    const navbar = $("plt-navbar");
    expect(navbar.style.getPropertyValue("--plt-navbar-height")).toBe("66px");
    spy.mockReturnValue({ height: 90 } as DOMRect);
    FakeObserver.instances[0].callback();
    expect(navbar.style.getPropertyValue("--plt-navbar-height")).toBe("90px");
    expect(document.documentElement.style.getPropertyValue("--plt-navbar-height")).toBe("");
    spy.mockRestore();
  });

  it('publishes on <html> with publish-height="root" and cleans up', () => {
    const spy = heightOf(66);
    document.body.innerHTML = markup('publish-height="root"');
    expect(document.documentElement.style.getPropertyValue("--plt-navbar-height")).toBe("66px");
    $("plt-navbar").remove();
    expect(FakeObserver.instances[0].disconnected).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--plt-navbar-height")).toBe("");
    spy.mockRestore();
  });

  it("does nothing without the attribute", () => {
    const spy = heightOf(66);
    document.body.innerHTML = markup();
    expect($("plt-navbar").style.getPropertyValue("--plt-navbar-height")).toBe("");
    expect(FakeObserver.instances).toHaveLength(0);
    spy.mockRestore();
  });
});

describe("<plt-navbar> deferred images", () => {
  const loaded = (id: string) => $<HTMLImageElement>(`#${id}`).getAttribute("src");

  it("keeps the images unloaded until idle (200 ms fallback when there is no idle callback)", () => {
    document.body.innerHTML = markup();
    expect(loaded("img-a")).toBeNull();
    vi.advanceTimersByTime(199);
    expect(loaded("img-a")).toBeNull();
    vi.advanceTimersByTime(1);
    expect(loaded("img-a")).toBe("a.jpg");
    expect($("#img-a").getAttribute("srcset")).toBe("a.jpg 1x, a2.jpg 2x");
    expect($("#img-a").getAttribute("sizes")).toBe("200px");
    expect($("#img-a").hasAttribute("data-deferred-src")).toBe(false);
    expect($("#img-a").hasAttribute("data-plt-navbar-deferred")).toBe(false);
  });

  it("uses requestIdleCallback with a 2 s timeout when there is one", () => {
    const request = vi.fn((callback: () => void) => {
      queueMicrotask(callback);
      return 7;
    });
    vi.stubGlobal("requestIdleCallback", request);
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    document.body.innerHTML = markup();
    expect(request).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 });
  });

  it("loads at the first hover intent, even while the panel waits", () => {
    document.body.innerHTML = markup('hover-delay="150"');
    over($("#b"));
    expect(loaded("img-a")).toBe("a.jpg");
    expect(open("panel-b")).toBe("false");
  });

  it("loads on focus, on opening the mobile menu, and when asked", () => {
    document.body.innerHTML = markup();
    $("#a").focus();
    expect(loaded("img-a")).toBe("a.jpg");

    document.body.innerHTML = markup();
    $("[data-plt-navbar-toggle]").click();
    expect(loaded("img-m")).toBe("m.jpg");

    document.body.innerHTML = markup();
    $("plt-navbar").activateDeferred();
    $("plt-navbar").activateDeferred();
    expect(loaded("img-a")).toBe("a.jpg");
  });

  it("cancels the idle load when disconnected", () => {
    document.body.innerHTML = markup();
    const image = $("#img-a");
    $("plt-navbar").remove();
    vi.advanceTimersByTime(1000);
    expect(image.getAttribute("src")).toBeNull();
  });

  it("schedules nothing when there are no deferred images", () => {
    const request = vi.fn();
    vi.stubGlobal("requestIdleCallback", request);
    document.body.innerHTML = markup().replace(/<img[^>]*>/g, "");
    expect(request).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
