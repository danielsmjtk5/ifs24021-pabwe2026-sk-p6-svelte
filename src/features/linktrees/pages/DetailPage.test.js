import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "User" };
  const mockLinkTree = {
    id: 1,
    title: "Awesome Link Tree",
    type: "public",
    description: "This is my link tree description",
    cover: "https://example.com/cover.jpg",
    created_at: "2026-01-01T00:00:00Z",
    author: {
      name: "Abdullah",
      photo: "https://example.com/author.jpg",
    },
    items: [
      {
        id: 10,
        title: "GitHub Profile",
        url: "https://github.com/delcom",
      },
      {
        id: 11,
        title: "Website",
        url: "https://delcom.org",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loader when profile or linkTree is null", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: null,
        linkTree: null,
      },
    });

    expect(wrapper.find(".animate-spin").exists()).toBe(true);

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });
    expect(wrapper2.find(".animate-spin").exists()).toBe(true);
  });

  it("should not call asyncSetLinkTree on mount if linkTreeId is null", () => {
    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: null },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
      },
    });

    const spy = vi.spyOn(linkTreesStore, "asyncSetLinkTree");
    expect(spy).not.toHaveBeenCalled();
  });

  it("should render link tree details, cover, author, and items", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    expect(wrapper.text()).toContain("Awesome Link Tree");
    expect(wrapper.text()).toContain("Oleh Abdullah");
    expect(wrapper.text()).toContain("GitHub Profile");
    expect(wrapper.text()).toContain("Website");
  });

  it("should render fallback author initial, null cover, and empty items", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          cover: null,
          type: "unlisted",
          author: { name: "", photo: null },
          items: [],
        },
      },
    });

    expect(wrapper.text()).toContain("Belum ada tautan ditambahkan");
  });

  it("should render private type badge and null author", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          type: "private",
          author: null,
        },
      },
    });

    expect(wrapper.text()).toContain("Akses: private");
  });

  it("should navigate to / when back link is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const backLink = wrapper.find('[data-testid="back-to-linktrees-link"]');
    await backLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should navigate to / if isLinkTree is true but linkTree is null", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: null,
        isLinkTree: false,
      },
    });

    linkTreesStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should stay when isLinkTree is true and linkTree exists", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
        isLinkTree: false,
      },
    });

    navSpy.mockClear();
    linkTreesStore.setIsLinkTree(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Awesome Link Tree");
    expect(navSpy).not.toHaveBeenCalled();
  });

  it("should navigate to / if isLinkTreeDeleted becomes true", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
        isLinkTreeDeleted: false,
      },
    });

    linkTreesStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should open and close ChangeCoverModal", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const coverBtn = wrapper.find('[data-testid="edit-cover-btn"]');
    await coverBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should open and close ChangeModal", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const editBtn = wrapper.find('[data-testid="edit-detail-linktree-btn"]');
    await editBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should open and close ItemModal in add mode", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const addItemBtn = wrapper.find('[data-testid="add-item-btn"]');
    await addItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should open and close ItemModal in edit mode", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const editItemBtn = wrapper.find('[data-testid="edit-item-10"]');
    await editItemBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should confirm and delete link tree on delete button click", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: true });

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    const deleteBtn = wrapper.find('[data-testid="delete-detail-linktree-btn"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 20));

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should not delete link tree when cancelled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    const deleteBtn = wrapper.find('[data-testid="delete-detail-linktree-btn"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 20));

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should confirm and delete item on item trash click", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: true });

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockReturnValue(Promise.resolve());

    const deleteItemBtn = wrapper.find('[data-testid="delete-item-10"]');
    await deleteItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 20));

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteItemSpy).toHaveBeenCalledWith(1, 10);
  });

  it("should not delete item when cancelled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const deleteItemSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemDelete")
      .mockReturnValue(Promise.resolve());

    const deleteItemBtn = wrapper.find('[data-testid="delete-item-10"]');
    await deleteItemBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 20));

    expect(deleteItemSpy).not.toHaveBeenCalled();
  });

  it("should reload detail when isItemDeleted becomes true", async () => {
    const { linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
        isItemDeleted: false,
      },
    });

    const refreshDetailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    linkTreesStore.setIsItemDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(refreshDetailSpy).toHaveBeenCalledWith(1);
  });

  it("should trigger asyncSetLinkTree on linkTreeId prop change", async () => {
    const { rerender, linkTreesStore } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: mockLinkTree,
      },
    });

    const spy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    await rerender({ linkTreeId: 2 });
    await new Promise((r) => setTimeout(r, 10));

    expect(spy).toHaveBeenCalledWith(2);
  });

  it("should render correctly when author is null and description is empty", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          author: null,
          description: "",
        },
      },
    });

    expect(wrapper.text()).toContain("Awesome Link Tree");
    expect(wrapper.text()).not.toContain("Oleh");
  });

  it("should render author initial when author has no photo", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          author: { name: "Budi", photo: null },
        },
      },
    });

    expect(wrapper.text()).toContain("B");
    expect(wrapper.text()).toContain("Oleh Budi");

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          author: { name: "", photo: null },
        },
      },
    });

    expect(wrapper2.text()).toContain("U");
  });

  it("should render unlisted and private link tree badges", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          type: "unlisted",
        },
      },
    });

    expect(wrapper.text()).toContain("Akses: unlisted");

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: {
        profile: mockProfile,
        linkTree: {
          ...mockLinkTree,
          type: "private",
        },
      },
    });

    expect(wrapper2.text()).toContain("Akses: private");
  });
});
