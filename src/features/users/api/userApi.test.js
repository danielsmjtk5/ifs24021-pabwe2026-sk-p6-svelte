import { describe, it, expect, vi } from "vitest";

vi.mock("../../../helpers/apiHelper.js", () => ({ apiRequest: vi.fn(() => "res") }));

import { apiRequest } from "../../../helpers/apiHelper.js";
import {
  getUsers,
  getUserById,
  getProfile,
  putProfile,
  postPhoto,
  postProfilePhoto,
  putPassword,
  putProfilePassword,
} from "./userApi.js";

describe("userApi", () => {
  it("mengambil daftar, detail, dan profil pengguna", () => {
    getUsers();
    expect(apiRequest).toHaveBeenCalledWith("/users");
    getUserById(7);
    expect(apiRequest).toHaveBeenCalledWith("/users/7");
    getProfile();
    expect(apiRequest).toHaveBeenCalledWith("/users/me");
  });
  it("memperbarui profil dari payload atau argumen terpisah", () => {
    putProfile({ name: "N", email: "e@x.y" });
    expect(apiRequest).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "N", email: "e@x.y" },
    });

    putProfile("N", "e@x.y");
    expect(apiRequest).toHaveBeenLastCalledWith("/users/me", {
      method: "PUT",
      body: { name: "N", email: "e@x.y" },
    });
  });
  it("memperlakukan payload profil null sebagai argumen nama", () => {
    putProfile(null, "e@x.y");
    expect(apiRequest).toHaveBeenLastCalledWith("/users/me", {
      method: "PUT",
      body: { name: null, email: "e@x.y" },
    });
  });
  it("postPhoto memakai FormData field photo", () => {
    const file = new File(["x"], "p.png", { type: "image/png" });
    postPhoto(file);
    const [path, options] = apiRequest.mock.calls.at(-1);
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.formData.get("photo")).toBe(file);
  });
  it("postProfilePhoto memakai endpoint dan field foto yang sama", () => {
    const file = new File(["x"], "p.png", { type: "image/png" });
    postProfilePhoto(file);
    const [path, options] = apiRequest.mock.calls.at(-1);
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.formData.get("photo")).toBe(file);
  });
  it("memetakan password dari payload camelCase atau snake_case", () => {
    putPassword({ password: "a", newPassword: "b", confirmation: "b" });
    expect(apiRequest).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: { password: "a", new_password: "b", new_password_confirmation: "b" },
    });

    putPassword({
      password: "a",
      new_password: "c",
      new_password_confirmation: "c",
    });
    expect(apiRequest).toHaveBeenLastCalledWith("/users/password", {
      method: "PUT",
      body: { password: "a", new_password: "c", new_password_confirmation: "c" },
    });
  });
  it("memperbarui password dari argumen terpisah dan gestur lama", () => {
    putPassword("a", "b", "b");
    expect(apiRequest).toHaveBeenLastCalledWith("/users/password", {
      method: "PUT",
      body: { password: "a", new_password: "b", new_password_confirmation: "b" },
    });

    putProfilePassword("a", "c", "c");
    expect(apiRequest).toHaveBeenLastCalledWith("/users/password", {
      method: "PUT",
      body: { password: "a", new_password: "c", new_password_confirmation: "c" },
    });
  });
  it("memperlakukan payload password null sebagai argumen terpisah", () => {
    putPassword(null, "b", "b");
    expect(apiRequest).toHaveBeenLastCalledWith("/users/password", {
      method: "PUT",
      body: { password: null, new_password: "b", new_password_confirmation: "b" },
    });
  });
});
