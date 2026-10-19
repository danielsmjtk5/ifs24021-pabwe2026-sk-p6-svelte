import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreesStore, { useLinkTreesStore } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("linkTreesStore", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    linkTreesStore.reset();
  });

  it("should have correct initial state and support reset", () => {
    expect(linkTreesStore.linkTrees).toEqual([]);
    expect(linkTreesStore.linkTree).toBeNull();
    expect(linkTreesStore.isLinkTree).toBe(false);
    expect(linkTreesStore.isLinkTreeAdd).toBe(false);
    expect(linkTreesStore.isLinkTreeAdded).toBe(false);
    expect(linkTreesStore.isLinkTreeChange).toBe(false);
    expect(linkTreesStore.isLinkTreeChanged).toBe(false);
    expect(linkTreesStore.isLinkTreeChangeCover).toBe(false);
    expect(linkTreesStore.isLinkTreeChangedCover).toBe(false);
    expect(linkTreesStore.isLinkTreeDelete).toBe(false);
    expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
    expect(linkTreesStore.isLinkTreeDeleteAll).toBe(false);
    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(false);
    expect(linkTreesStore.isItemAdd).toBe(false);
    expect(linkTreesStore.isItemAdded).toBe(false);
    expect(linkTreesStore.isItemChange).toBe(false);
    expect(linkTreesStore.isItemChanged).toBe(false);
    expect(linkTreesStore.isItemDelete).toBe(false);
    expect(linkTreesStore.isItemDeleted).toBe(false);

    linkTreesStore.setLinkTrees([{ id: 1 }]);
    expect(linkTreesStore.linkTrees).toEqual([{ id: 1 }]);
    linkTreesStore.reset({ linkTrees: [{ id: 99 }] });
    expect(linkTreesStore.linkTrees).toEqual([{ id: 99 }]);

    linkTreesStore.reset();
    expect(linkTreesStore.linkTrees).toEqual([]);
  });

  it("should test all setter methods", () => {
    linkTreesStore.setLinkTree({ id: 2 });
    expect(linkTreesStore.linkTree).toEqual({ id: 2 });

    linkTreesStore.setIsLinkTree(true);
    expect(linkTreesStore.isLinkTree).toBe(true);

    linkTreesStore.setIsLinkTreeAdd(true);
    expect(linkTreesStore.isLinkTreeAdd).toBe(true);

    linkTreesStore.setIsLinkTreeAdded(true);
    expect(linkTreesStore.isLinkTreeAdded).toBe(true);

    linkTreesStore.setIsLinkTreeChange(true);
    expect(linkTreesStore.isLinkTreeChange).toBe(true);

    linkTreesStore.setIsLinkTreeChanged(true);
    expect(linkTreesStore.isLinkTreeChanged).toBe(true);

    linkTreesStore.setIsLinkTreeChangeCover(true);
    expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);

    linkTreesStore.setIsLinkTreeChangedCover(true);
    expect(linkTreesStore.isLinkTreeChangedCover).toBe(true);

    linkTreesStore.setIsLinkTreeDelete(true);
    expect(linkTreesStore.isLinkTreeDelete).toBe(true);

    linkTreesStore.setIsLinkTreeDeleted(true);
    expect(linkTreesStore.isLinkTreeDeleted).toBe(true);

    linkTreesStore.setIsLinkTreeDeleteAll(true);
    expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);

    linkTreesStore.setIsLinkTreeDeletedAll(true);
    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(true);

    linkTreesStore.setIsItemAdd(true);
    expect(linkTreesStore.isItemAdd).toBe(true);

    linkTreesStore.setIsItemAdded(true);
    expect(linkTreesStore.isItemAdded).toBe(true);

    linkTreesStore.setIsItemChange(true);
    expect(linkTreesStore.isItemChange).toBe(true);

    linkTreesStore.setIsItemChanged(true);
    expect(linkTreesStore.isItemChanged).toBe(true);

    linkTreesStore.setIsItemDelete(true);
    expect(linkTreesStore.isItemDelete).toBe(true);

    linkTreesStore.setIsItemDeleted(true);
    expect(linkTreesStore.isItemDeleted).toBe(true);
  });

  it("should handle asyncSetLinkTrees success and failure", async () => {
    vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([{ id: 1, title: "LT 1" }]);
    await linkTreesStore.asyncSetLinkTrees();
    expect(linkTreesStore.linkTrees).toEqual([{ id: 1, title: "LT 1" }]);

    vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("Network Error"));
    await linkTreesStore.asyncSetLinkTrees();
    expect(linkTreesStore.linkTrees).toEqual([]);
  });

  it("should handle asyncSetLinkTree success and failure", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({ id: 1, title: "LT Detail" });
    await linkTreesStore.asyncSetLinkTree(1);
    expect(linkTreesStore.linkTree).toEqual({ id: 1, title: "LT Detail" });
    expect(linkTreesStore.isLinkTree).toBe(true);

    vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("Fail"));
    await linkTreesStore.asyncSetLinkTree(2);
    expect(linkTreesStore.linkTree).toBeNull();
    expect(linkTreesStore.isLinkTree).toBe(true);
  });

  it("should handle asyncSetIsLinkTreeAdd success and failure", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    vi.spyOn(linkTreeApi, "postLinkTree").mockResolvedValue({ link_tree_id: 10 });
    await linkTreesStore.asyncSetIsLinkTreeAdd("Title", "public", "Desc");
    expect(successSpy).toHaveBeenCalledWith("Link Tree berhasil ditambahkan!");
    expect(linkTreesStore.isLinkTreeAdded).toBe(true);
    expect(linkTreesStore.isLinkTreeAdd).toBe(true);

    vi.spyOn(linkTreeApi, "postLinkTree").mockRejectedValue(new Error("Add error"));
    await linkTreesStore.asyncSetIsLinkTreeAdd("Title", "public", "Desc");
    expect(errorSpy).toHaveBeenCalledWith("Add error");
    expect(linkTreesStore.isLinkTreeAdded).toBe(false);
  });

  it("should handle asyncSetIsLinkTreeChange success and failure", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("Berhasil update");
    await linkTreesStore.asyncSetIsLinkTreeChange(1, "Updated", "public", "Desc");
    expect(successSpy).toHaveBeenCalledWith("Berhasil update");
    expect(linkTreesStore.isLinkTreeChanged).toBe(true);
    expect(linkTreesStore.isLinkTreeChange).toBe(true);

    vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("");
    await linkTreesStore.asyncSetIsLinkTreeChange(1, "Updated", "public", "Desc");
    expect(successSpy).toHaveBeenCalledWith("Link Tree berhasil diperbarui!");

    vi.spyOn(linkTreeApi, "putLinkTree").mockRejectedValue(new Error("Change error"));
    await linkTreesStore.asyncSetIsLinkTreeChange(1, "Updated", "public", "Desc");
    expect(errorSpy).toHaveBeenCalledWith("Change error");
    expect(linkTreesStore.isLinkTreeChanged).toBe(false);
  });

  it("should handle asyncSetIsLinkTreeChangeCover success and failure", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("Cover diubah");
    await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
    expect(successSpy).toHaveBeenCalledWith("Cover diubah");
    expect(linkTreesStore.isLinkTreeChangedCover).toBe(true);
    expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);

    vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("");
    await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
    expect(successSpy).toHaveBeenCalledWith("Cover berhasil diperbarui!");

    vi.spyOn(linkTreeApi, "postLinkTreeCover").mockRejectedValue(new Error("Cover error"));
    await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
    expect(errorSpy).toHaveBeenCalledWith("Cover error");
    expect(linkTreesStore.isLinkTreeChangedCover).toBe(false);
  });

  it("should handle asyncSetIsLinkTreeDelete success and failure", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("Terhapus");
    await linkTreesStore.asyncSetIsLinkTreeDelete(1);
    expect(successSpy).toHaveBeenCalledWith("Terhapus");
    expect(linkTreesStore.isLinkTreeDeleted).toBe(true);
    expect(linkTreesStore.isLinkTreeDelete).toBe(true);

    vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("");
    await linkTreesStore.asyncSetIsLinkTreeDelete(1);
    expect(successSpy).toHaveBeenCalledWith("Link Tree berhasil dihapus!");

    vi.spyOn(linkTreeApi, "deleteLinkTree").mockRejectedValue(new Error("Delete error"));
    await linkTreesStore.asyncSetIsLinkTreeDelete(1);
    expect(errorSpy).toHaveBeenCalledWith("Delete error");
    expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
  });

  it("should handle asyncSetIsLinkTreeDeleteAll success and failure", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    vi.spyOn(linkTreeApi, "deleteLinkTrees").mockResolvedValue("Semua terhapus");
    await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
    expect(successSpy).toHaveBeenCalledWith("Semua terhapus");
    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(true);
    expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);

    vi.spyOn(linkTreeApi, "deleteLinkTrees").mockResolvedValue("");
    await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
    expect(successSpy).toHaveBeenCalledWith("Semua data link tree berhasil dihapus!");

    vi.spyOn(linkTreeApi, "deleteLinkTrees").mockRejectedValue(new Error("Delete all error"));
    await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
    expect(errorSpy).toHaveBeenCalledWith("Delete all error");
    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(false);
  });

  it("should handle asyncSetIsItemAdd success and failure", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    vi.spyOn(linkTreeApi, "postLinkTreeItem").mockResolvedValue({ item_id: 1 });
    await linkTreesStore.asyncSetIsItemAdd(1, "Google", "https://google.com");
    expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil ditambahkan!");
    expect(linkTreesStore.isItemAdded).toBe(true);
    expect(linkTreesStore.isItemAdd).toBe(true);

    vi.spyOn(linkTreeApi, "postLinkTreeItem").mockRejectedValue(new Error("Item add error"));
    await linkTreesStore.asyncSetIsItemAdd(1, "Google", "https://google.com");
    expect(errorSpy).toHaveBeenCalledWith("Item add error");
    expect(linkTreesStore.isItemAdded).toBe(false);
  });

  it("should handle asyncSetIsItemChange success and failure", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("Item diubah");
    await linkTreesStore.asyncSetIsItemChange(1, 2, "Google", "https://google.com");
    expect(successSpy).toHaveBeenCalledWith("Item diubah");
    expect(linkTreesStore.isItemChanged).toBe(true);
    expect(linkTreesStore.isItemChange).toBe(true);

    vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("");
    await linkTreesStore.asyncSetIsItemChange(1, 2, "Google", "https://google.com");
    expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil diperbarui!");

    vi.spyOn(linkTreeApi, "putLinkTreeItem").mockRejectedValue(new Error("Item change error"));
    await linkTreesStore.asyncSetIsItemChange(1, 2, "Google", "https://google.com");
    expect(errorSpy).toHaveBeenCalledWith("Item change error");
    expect(linkTreesStore.isItemChanged).toBe(false);
  });

  it("should handle asyncSetIsItemDelete success and failure", async () => {
    const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("Item dihapus");
    await linkTreesStore.asyncSetIsItemDelete(1, 2);
    expect(successSpy).toHaveBeenCalledWith("Item dihapus");
    expect(linkTreesStore.isItemDeleted).toBe(true);
    expect(linkTreesStore.isItemDelete).toBe(true);

    vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("");
    await linkTreesStore.asyncSetIsItemDelete(1, 2);
    expect(successSpy).toHaveBeenCalledWith("Item tautan berhasil dihapus!");

    vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockRejectedValue(new Error("Item delete error"));
    await linkTreesStore.asyncSetIsItemDelete(1, 2);
    expect(errorSpy).toHaveBeenCalledWith("Item delete error");
    expect(linkTreesStore.isItemDeleted).toBe(false);
  });

  it("should support useLinkTreesStore hook", () => {
    expect(useLinkTreesStore()).toBe(linkTreesStore);
  });
});
