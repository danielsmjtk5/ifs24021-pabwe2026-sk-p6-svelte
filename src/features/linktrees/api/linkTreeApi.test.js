import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreeApi from "./linkTreeApi";
import apiHelper from "../../../helpers/apiHelper";

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postLinkTree", () => {
    it("should create new link tree and return data", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_tree_id: 10 },
        }),
      });

      const res = await linkTreeApi.postLinkTree("Title", "public", "Description");
      expect(res).toEqual({ link_tree_id: 10 });
    });

    it("should throw error if creation fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      });

      await expect(
        linkTreeApi.postLinkTree("", "public", "")
      ).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        linkTreeApi.postLinkTree("", "public", "")
      ).rejects.toThrow("Gagal menambahkan data link tree");
    });
  });

  describe("postLinkTreeCover", () => {
    it("should upload cover with FormData and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah cover",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      const msg = await linkTreeApi.postLinkTreeCover(1, dummyFile);
      expect(msg).toBe("Berhasil mengubah cover");
    });

    it("should handle cover file without name property properly", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil",
        }),
      });

      const dummyBlob = new Blob(["dummy"], { type: "image/jpeg" });
      const msg = await linkTreeApi.postLinkTreeCover(1, dummyBlob);
      expect(msg).toBe("Berhasil");
    });

    it("should throw error on upload cover fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Format tidak didukung",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(linkTreeApi.postLinkTreeCover(1, dummyFile)).rejects.toThrow(
        "Format tidak didukung"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(linkTreeApi.postLinkTreeCover(1, dummyFile)).rejects.toThrow(
        "Gagal mengubah cover link tree"
      );
    });
  });

  describe("putLinkTree", () => {
    it("should update link tree and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      });

      const res = await linkTreeApi.putLinkTree(1, "Updated", "private", "Desc");
      expect(res).toBe("Berhasil mengubah data");
    });

    it("should throw error when updating link tree fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Judul tidak boleh kosong",
        }),
      });

      await expect(
        linkTreeApi.putLinkTree(1, "", "public", "")
      ).rejects.toThrow("Judul tidak boleh kosong");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        linkTreeApi.putLinkTree(1, "", "public", "")
      ).rejects.toThrow("Gagal mengubah data link tree");
    });
  });

  describe("getLinkTrees", () => {
    it("should fetch all link trees without filter and return list", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {
            link_trees: [{ id: 1, title: "Tautan 1" }],
          },
        }),
      });

      const res = await linkTreeApi.getLinkTrees();
      expect(res).toEqual([{ id: 1, title: "Tautan 1" }]);
    });

    it("should fetch link trees with is_me query", async () => {
      const fetchSpy = vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {
            link_trees: [{ id: 2, title: "Tautan Milik Saya" }],
          },
        }),
      });

      const res = await linkTreeApi.getLinkTrees("1");
      expect(res).toEqual([{ id: 2, title: "Tautan Milik Saya" }]);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("?is_me=1"),
        expect.any(Object)
      );
    });

    it("should return empty array when data or link_trees is undefined", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {},
        }),
      });

      const res = await linkTreeApi.getLinkTrees();
      expect(res).toEqual([]);
    });

    it("should throw error when fetch fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Unauthorized",
        }),
      });

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Unauthorized");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow(
        "Gagal mengambil data link tree"
      );
    });
  });

  describe("getLinkTreeById", () => {
    it("should fetch detail of link tree", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {
            link_tree: { id: 1, title: "Detail Link Tree", items: [] },
          },
        }),
      });

      const res = await linkTreeApi.getLinkTreeById(1);
      expect(res).toEqual({ id: 1, title: "Detail Link Tree", items: [] });
    });

    it("should throw error when fetch detail fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak ditemukan",
        }),
      });

      await expect(linkTreeApi.getLinkTreeById(999)).rejects.toThrow(
        "Data tidak ditemukan"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.getLinkTreeById(999)).rejects.toThrow(
        "Gagal mengambil detail link tree"
      );
    });
  });

  describe("deleteLinkTree", () => {
    it("should delete link tree by id", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus data",
        }),
      });

      const res = await linkTreeApi.deleteLinkTree(1);
      expect(res).toBe("Berhasil menghapus data");
    });

    it("should throw error when delete link tree fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus",
        }),
      });

      await expect(linkTreeApi.deleteLinkTree(1)).rejects.toThrow("Gagal menghapus");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.deleteLinkTree(1)).rejects.toThrow(
        "Gagal menghapus link tree"
      );
    });
  });

  describe("deleteLinkTrees", () => {
    it("should delete all link trees", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus semua data link tree",
        }),
      });

      const res = await linkTreeApi.deleteLinkTrees();
      expect(res).toBe("Berhasil menghapus semua data link tree");
    });

    it("should throw error when delete all fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Unauthenticated",
        }),
      });

      await expect(linkTreeApi.deleteLinkTrees()).rejects.toThrow("Unauthenticated");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.deleteLinkTrees()).rejects.toThrow(
        "Gagal menghapus semua data link tree"
      );
    });
  });

  describe("postLinkTreeItem", () => {
    it("should add item and return data", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { item_id: 5 },
        }),
      });

      const res = await linkTreeApi.postLinkTreeItem(1, "Google", "https://google.com");
      expect(res).toEqual({ item_id: 5 });
    });

    it("should throw error when add item fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "URL tidak valid",
        }),
      });

      await expect(
        linkTreeApi.postLinkTreeItem(1, "Google", "invalid-url")
      ).rejects.toThrow("URL tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        linkTreeApi.postLinkTreeItem(1, "Google", "invalid")
      ).rejects.toThrow("Gagal menambahkan item tautan");
    });
  });

  describe("putLinkTreeItem", () => {
    it("should update item and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      });

      const res = await linkTreeApi.putLinkTreeItem(1, 2, "Updated", "https://example.com");
      expect(res).toBe("Berhasil mengubah data");
    });

    it("should throw error when update item fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Item tidak ditemukan",
        }),
      });

      await expect(
        linkTreeApi.putLinkTreeItem(1, 2, "Updated", "https://example.com")
      ).rejects.toThrow("Item tidak ditemukan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        linkTreeApi.putLinkTreeItem(1, 2, "Updated", "https://example.com")
      ).rejects.toThrow("Gagal mengubah item tautan");
    });
  });

  describe("deleteLinkTreeItem", () => {
    it("should delete item and return message", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus data",
        }),
      });

      const res = await linkTreeApi.deleteLinkTreeItem(1, 2);
      expect(res).toBe("Berhasil menghapus data");
    });

    it("should throw error when delete item fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus item",
        }),
      });

      await expect(linkTreeApi.deleteLinkTreeItem(1, 2)).rejects.toThrow(
        "Gagal menghapus item"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.deleteLinkTreeItem(1, 2)).rejects.toThrow(
        "Gagal menghapus item tautan"
      );
    });
  });
});
