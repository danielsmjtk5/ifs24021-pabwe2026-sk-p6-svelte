import { describe, it, expect, vi, beforeEach } from "vitest";
import SidebarComponent from "./SidebarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("SidebarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render navigation items", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      route: "/",
      props: {
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Menu Utama");
    expect(wrapper.text()).toContain("Semua Link Tree");
    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("should navigate to link and trigger close-mobile when nav item clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(SidebarComponent, {
      route: "/",
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const links = wrapper.findAll("a");
    await links[1].trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/users");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should close sidebar when backdrop is clicked", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);
    await backdrop.trigger("click");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should close sidebar when pressing Escape on backdrop", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("keydown", { key: "Escape" });
    expect(closeSpy).toHaveBeenCalled();

    // Key other than Escape
    await backdrop.trigger("keydown", { key: "Enter" });
  });

  it("should handle navigation when onCloseMobile is omitted", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: false,
      },
    });

    const links = wrapper.findAll("a");
    await links[2].trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/profile");
  });

  it("should handle backdrop click when onCloseMobile is omitted", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("click");
    await backdrop.trigger("keydown", { key: "Escape" });
    expect(wrapper.exists()).toBe(true);
  });
});
