import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeCoverModal", () => {
  const mockLinkTree = {
    id: 1,
    title: "Tree with cover",
    cover: "https://example.com/cover.jpg",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:preview-url");
  });

  it("should not render when show is false or linkTree is null", () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: false, linkTree: mockLinkTree },
    });
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    const { wrapper: wrapper2 } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: null },
    });
    expect(wrapper2.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should render placeholder when cover is null", () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: { id: 2, title: "No cover", cover: null } },
    });
    expect(wrapper.text()).toContain("Klik untuk unggah berkas");
  });

  it("should render when open and close on close/cancel buttons", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });

    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    const cancelBtn = wrapper.find('[data-testid="cancel-cover-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalled();

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should validate file selection", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    const fileInput = wrapper.find('[data-testid="linktree-cover-file-input"]');
    const form = wrapper.find("form");

    // Case 1: submit without file
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Silakan pilih cover baru!");

    // Case 2: change event with empty files
    Object.defineProperty(fileInput.element, "files", {
      value: [],
      writable: true,
    });
    await fileInput.trigger("change");

    // Case 3: select non-image file
    const textFile = new File(["dummy text"], "test.txt", { type: "text/plain" });
    Object.defineProperty(fileInput.element, "files", {
      value: [textFile],
      writable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar (JPG/PNG)!");

    // Case 4: select file larger than 1MB
    const bigFile = new File(["x".repeat(1024 * 1024 + 10)], "big.png", {
      type: "image/png",
    });
    Object.defineProperty(bigFile, "size", { value: 1024 * 1024 + 10 });
    Object.defineProperty(fileInput.element, "files", {
      value: [bigFile],
      writable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Ukuran gambar maksimal 1MB!");
  });

  it("should handle valid file selection and submit cover", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    const coverSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeChangeCover")
      .mockReturnValue(Promise.resolve());

    const fileInput = wrapper.find('[data-testid="linktree-cover-file-input"]');
    const validFile = new File(["valid image"], "photo.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(validFile, "size", { value: 500 * 1024 });

    Object.defineProperty(fileInput.element, "files", {
      value: [validFile],
      writable: true,
    });
    await fileInput.trigger("change");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(coverSpy).toHaveBeenCalledWith(1, validFile);
  });

  it("should handle response when cover is changed successfully", async () => {
    const closeSpy = vi.fn();
    const { linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });

    const refreshDetailSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    linkTreesStore.setIsLinkTreeChangedCover(true);
    linkTreesStore.setIsLinkTreeChangeCover(true);

    await new Promise((r) => setTimeout(r, 10));

    expect(refreshDetailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle isLinkTreeChangeCover true when isLinkTreeChangedCover is false", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
      preloadedState: {
        isLinkTreeChangeCover: false,
        isLinkTreeChangedCover: false,
      },
    });

    linkTreesStore.setIsLinkTreeChangeCover(true);
    linkTreesStore.setIsLinkTreeChangedCover(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
  });

  it("should handle close without onClose callback", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.exists()).toBe(true);
  });
});
