import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ItemModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: false, linkTreeId: 1 },
    });
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should render add mode properly and handle close", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null, onClose: closeSpy },
    });

    expect(wrapper.text()).toContain("Tambah Item Tautan");

    const cancelBtn = wrapper.find('[data-testid="cancel-item-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalled();

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should validate empty fields on save in add mode", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("My GitHub");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("URL tautan tidak boleh kosong");
  });

  it("should submit new item in add mode and call asyncSetIsItemAdd", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });

    const addSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemAdd")
      .mockReturnValue(Promise.resolve());

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    const form = wrapper.find("form");

    await titleInput.setValue("GitHub");
    await urlInput.setValue("https://github.com");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(1, "GitHub", "https://github.com");
  });

  it("should render edit mode and submit changes via asyncSetIsItemChange", async () => {
    const mockItem = {
      id: 5,
      title: "Existing Link",
      url: "https://old.com",
    };

    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
    });

    expect(wrapper.text()).toContain("Ubah Item Tautan");

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    expect(titleInput.element.value).toBe("Existing Link");
    expect(urlInput.element.value).toBe("https://old.com");

    const changeSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsItemChange")
      .mockReturnValue(Promise.resolve());

    await titleInput.setValue("Updated Link");
    await urlInput.setValue("https://new.com");
    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, 5, "Updated Link", "https://new.com");
  });

  it("should handle response when item is added successfully", async () => {
    const closeSpy = vi.fn();
    const { linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null, onClose: closeSpy },
    });

    const refreshDetailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    linkTreesStore.setIsItemAdded(true);
    linkTreesStore.setIsItemAdd(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(refreshDetailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isItemAdd true when isItemAdded is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
      preloadedState: {
        isItemAdd: false,
        isItemAdded: false,
      },
    });

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should handle response when item is changed successfully", async () => {
    const closeSpy = vi.fn();
    const { linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: { id: 2 }, onClose: closeSpy },
    });

    const refreshDetailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    linkTreesStore.setIsItemChanged(true);
    linkTreesStore.setIsItemChange(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(refreshDetailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isItemChange true when isItemChanged is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: { id: 2 } },
      preloadedState: {
        isItemChange: false,
        isItemChanged: false,
      },
    });

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.exists()).toBe(true);
  });
});
