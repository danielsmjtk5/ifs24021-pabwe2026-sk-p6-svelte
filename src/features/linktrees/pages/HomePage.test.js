import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import linkTreeApi from "../api/linkTreeApi";

describe("HomePage", () => {
  const mockLinkTrees = [
    {
      id: 1,
      title: "First Link Tree",
      description: "Description one",
      type: "public",
      total_links: 3,
      cover: "https://example.com/c1.jpg",
      created_at: "2026-01-01T00:00:00Z",
      author: { name: "Abdullah", photo: "https://example.com/a.jpg" },
    },
    {
      id: 2,
      title: "Second Tree",
      description: "Description two",
      type: "private",
      total_links: 5,
      cover: null,
      created_at: "2026-01-02T00:00:00Z",
      author: { name: "", photo: null },
    },
    {
      id: 3,
      title: "Unlisted Tree",
      description: "",
      type: "unlisted",
      total_links: 0,
      cover: null,
      created_at: "2026-01-03T00:00:00Z",
      author: null,
    },
    {
      id: 4,
      title: "Fourth Tree",
      description: "Description four",
      type: "public",
      total_links: 1,
      cover: null,
      created_at: "2026-01-04T00:00:00Z",
      author: { name: "Charlie", photo: null },
    },
    {
      id: 5,
      title: "Fifth Tree",
      description: "Description five",
      type: "public",
      total_links: 2,
      cover: null,
      created_at: "2026-01-05T00:00:00Z",
      author: { name: "", photo: "https://example.com/c5.jpg" },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when profile is null", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: null,
        linkTrees: [],
      },
    });

    expect(wrapper.find('[data-testid="add-linktree-btn"]').exists()).toBe(false);
  });

  it("should render page header, statistics, and table with link trees", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    expect(wrapper.text()).toContain("Daftar Link Tree");
    expect(wrapper.text()).toContain("Total Link Tree");
    expect(wrapper.text()).toContain("First Link Tree");
    expect(wrapper.text()).toContain("Second Tree");
    expect(wrapper.text()).toContain("Unlisted Tree");
  });

  it("should filter link trees based on search query", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const searchInput = wrapper.find('[data-testid="search-linktree-input"]');
    await searchInput.setValue("first");

    expect(wrapper.text()).toContain("First Link Tree");
    expect(wrapper.text()).not.toContain("Second Tree");

    // Search by description
    await searchInput.setValue("two");
    expect(wrapper.text()).toContain("Second Tree");
  });

  it("should show empty state when no link trees match", async () => {
    vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([]);
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: [],
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.text()).toContain("Tidak ada link tree ditemukan");
  });

  it("should handle filter change (e.g. milik saya)", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const fetchSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();

    const filterSelect = wrapper.find('[data-testid="filter-linktree-select"]');
    await filterSelect.setValue("1");

    expect(fetchSpy).toHaveBeenCalledWith("1");
  });

  it("should navigate to detail page when title or detail button is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const detailBtn = wrapper.find('[data-testid="detail-linktree-1"]');
    await detailBtn.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/link-trees/1");

    // Click title
    const titleBtn = wrapper.findAll("table button")[0];
    await titleBtn.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/link-trees/1");
  });

  it("should open and close AddModal", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const addBtn = wrapper.find('[data-testid="add-linktree-btn"]');
    await addBtn.trigger("click");
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(false);
  });

  it("should open and close ChangeModal", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const editBtn = wrapper.find('[data-testid="edit-linktree-1"]');
    await editBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should confirm and delete link tree on delete button click", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: true });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    const deleteBtn = wrapper.find('[data-testid="delete-linktree-1"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 20));

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should not delete link tree when cancelled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockReturnValue(Promise.resolve());

    const deleteBtn = wrapper.find('[data-testid="delete-linktree-1"]');
    await deleteBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 20));

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should confirm and delete all link trees on delete all button click", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValue({ isConfirmed: true });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const deleteAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteAll")
      .mockReturnValue(Promise.resolve());

    const deleteAllBtn = wrapper.find('[data-testid="delete-all-linktrees-btn"]');
    await deleteAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 20));

    expect(confirmSpy).toHaveBeenCalled();
    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should not delete all link trees when cancelled", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false });

    const { wrapper, linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
      },
    });

    const deleteAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteAll")
      .mockReturnValue(Promise.resolve());

    const deleteAllBtn = wrapper.find('[data-testid="delete-all-linktrees-btn"]');
    await deleteAllBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 20));

    expect(deleteAllSpy).not.toHaveBeenCalled();
  });

  it("should reload list when isLinkTreeDeleted becomes true", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
        isLinkTreeDeleted: false,
      },
    });

    const refreshSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();

    linkTreesStore.setIsLinkTreeDeleted(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(refreshSpy).toHaveBeenCalled();
  });

  it("should reload list when isLinkTreeDeletedAll becomes true", async () => {
    const { linkTreesStore } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: mockLinkTrees,
        isLinkTreeDeletedAll: false,
      },
    });

    const refreshSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockResolvedValue();

    linkTreesStore.setIsLinkTreeDeletedAll(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(refreshSpy).toHaveBeenCalled();
  });

  it("should handle search against link trees with null title and description", async () => {
    vi.spyOn(toolsHelper, "formatDate").mockReturnValue("-");
    vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([]);

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: { id: 1, name: "User" },
        linkTrees: [{ id: 99, title: null, description: null, type: null, total_links: null, author: null }],
      },
    });
    await new Promise((r) => setTimeout(r, 20));

    const searchInput = wrapper.find('[data-testid="search-linktree-input"]');
    await searchInput.setValue("xyz");
    expect(wrapper.text()).toContain("Tidak ada link tree ditemukan");
  });
});
